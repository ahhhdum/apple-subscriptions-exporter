// Structure validator class
class StructureValidator {
  constructor() {
    this.version = '1.0.1';
    this.selectors = {
      purchase: 'div.purchase.loaded',
      header: 'h3.purchase-header',
      date: 'span[data-auto-test-id*="PurchaseHeader.Display.Date"]',
      orderId: 'span[data-auto-test-id*="PurchaseHeader.Display.WebOrder"]',
      totalAmount: 'span[data-auto-test-id*="Display.Invoice.Amount"]',
      purchaseDetails: 'div.purchase-details',
      documentNo: 'span[data-auto-test-id*="PurchaseDetails.Display.DocumentNumber"]',
      billedTo: '[data-auto-test-id*="PaymentMethod"]',
      billingName: '[data-auto-test-id*="PurchaseDetails.Display.Name"]',
      itemList: 'ul.pli-list',
      item: 'li.pli',
      itemName: 'div[aria-label]',
      publisher: 'div.pli-publisher',
      itemPrice: 'div.pli-price span'
    };

    // Define which elements are required vs optional
    this.requiredElements = {
      'Purchase Header': this.selectors.header,
      'Date': this.selectors.date,
      'Order ID': this.selectors.orderId
    };

    this.requiredItemElements = {
      'Item Name': this.selectors.itemName,
      'Price': this.selectors.itemPrice
    };

    // Optional elements don't need validation
    this.optionalElements = [
      'itemDateTime',
      'subscriptionInfo',
      'manageSubLink'
    ];
  }

  async validate() {
    const errors = [];
    const timestamp = new Date().toISOString();

    try {
      // Check if we have any purchases
      const purchases = document.querySelectorAll(this.selectors.purchase);
      if (purchases.length === 0) {
        return {
          isValid: false,
          version: this.version,
          timestamp,
          errors: [{
            message: 'No purchases found on the page. Make sure you are on the correct page and purchases have loaded.',
            timestamp
          }]
        };
      }

      // Take the first purchase for structure validation
      const purchase = purchases[0];
      
      // Validate required elements
      for (const [name, selector] of Object.entries(this.requiredElements)) {
        if (!purchase.querySelector(selector)) {
          errors.push({
            message: `${name} element not found. The page structure may have changed.`,
            timestamp,
            selector
          });
        }
      }

      // Check for items
      const items = purchase.querySelectorAll(this.selectors.item);
      if (items.length === 0) {
        errors.push({
          message: 'No items found in the purchase. The page structure may have changed.',
          timestamp
        });
      } else {
        // Validate item structure (only required elements)
        const item = items[0];
        for (const [name, selector] of Object.entries(this.requiredItemElements)) {
          if (!item.querySelector(selector)) {
            errors.push({
              message: `${name} element not found in item. The item structure may have changed.`,
              timestamp,
              selector
            });
          }
        }
      }

      return {
        isValid: errors.length === 0,
        version: this.version,
        timestamp,
        errors
      };
    } catch (error) {
      return {
        isValid: false,
        version: this.version,
        timestamp,
        errors: [{
          message: `Validation error: ${error.message}`,
          timestamp
        }]
      };
    }
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'validate') {
    // Handle validation request
    const validator = new StructureValidator();
    validator.validate()
      .then(results => {
        sendResponse(results);
      })
      .catch(error => {
        sendResponse({ 
          isValid: false, 
          errors: [{
            message: error.message,
            timestamp: new Date().toISOString()
          }]
        });
      });
    return true; // Required for async response
  }
  else if (request.action === 'extract') {
    validateAndExtract(request.maxPurchases)
      .then(result => {
        sendResponse(result);
      })
      .catch(error => {
        sendResponse({ 
          success: false, 
          error: error.message,
          details: error.validationResults
        });
      });
    return true; // Required for async response
  }
});

async function validateAndExtract(maxPurchases) {
  // Validate page structure first
  const validator = new StructureValidator();
  const validationResults = await validator.validate();

  // If validation fails, return detailed error
  if (!validationResults.isValid) {
    const error = new Error('Page structure has changed. Please update the extension.');
    error.validationResults = validationResults;
    throw error;
  }

  // If structure is valid, proceed with extraction
  const transactions = await extractTransactionsAsync(maxPurchases);
  return {
    success: true,
    csv: convertToCSV(transactions),
    processedCount: transactions.length,
    validationResults
  };
}

async function waitForElement(selector, parent = document) {
  return new Promise((resolve) => {
    const element = parent.querySelector(selector);
    if (element && !element.classList.contains('loading')) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = parent.querySelector(selector);
      if (element && !element.classList.contains('loading')) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(parent, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });
  });
}

async function expandAndWaitForDetails(purchase) {
  // Check if it's a free item or no receipt before expanding
  const noInvoiceDiv = purchase.querySelector('div.purchase-details.no-invoice');
  if (noInvoiceDiv) {
    // It's either free or has no receipt - no need to expand
    return;
  }

  const button = purchase.querySelector('button.disclosure[aria-expanded="false"]');
  if (button) {
    // Add visual feedback
    purchase.style.backgroundColor = '#f0f8ff'; // Light blue to show processing
    
    // Add random delay between 300-700ms before clicking to simulate human behavior
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
    
    button.click();
    // Wait for the purchase-details to load
    await waitForElement('div.purchase-details:not(.loading)', purchase);
    // Add small random delay after loading
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // Reset background color
    purchase.style.backgroundColor = '';
  }
}

async function loadMorePurchases(targetCount) {
  const getLoadedCount = () => document.querySelectorAll('div.purchase.loaded').length;
  let currentCount = getLoadedCount();
  let previousCount = 0;
  let attempts = 0;
  const maxAttempts = 10; // Prevent infinite loops

  while (currentCount < targetCount && attempts < maxAttempts && currentCount !== previousCount) {
    previousCount = currentCount;
    
    // Scroll to bottom to trigger loading
    window.scrollTo(0, document.body.scrollHeight);
    
    // Wait for new items to load (up to 2 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    currentCount = getLoadedCount();
    attempts++;
  }

  // Scroll back to top
  window.scrollTo(0, 0);
  return currentCount;
}

async function extractTransactionsAsync(maxPurchases = 50) {
  const transactions = [];
  
  // Add initial progress indicator
  const progressDiv = document.createElement('div');
  progressDiv.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #007AFF; color: white; padding: 10px; border-radius: 5px; z-index: 9999;';
  document.body.appendChild(progressDiv);
  
  try {
    // First, try to load the requested number of purchases
    progressDiv.textContent = 'Loading purchases...';
    const loadedCount = await loadMorePurchases(maxPurchases);
    
    // Find all transactions
    const purchases = document.querySelectorAll('div.purchase.loaded');
    
    // Use configured limit or all available if less than requested
    const purchasesToProcess = Array.from(purchases).slice(0, maxPurchases);
    
    // Process purchases sequentially to avoid overwhelming the page
    for (let i = 0; i < purchasesToProcess.length; i++) {
      const purchase = purchasesToProcess[i];
      try {
        // Update progress
        progressDiv.textContent = `Processing ${i + 1} of ${purchasesToProcess.length}...`;
        
        // Extract purchase-level details from header first
        const header = purchase.querySelector('h3.purchase-header');
        const date = header?.querySelector('span[data-auto-test-id="RAP2.PurchaseList.PurchaseHeader.Display.Date"]')?.textContent.trim() || '';
        const orderId = header?.querySelector('span[data-auto-test-id="RAP2.PurchaseList.PurchaseHeader.Display.WebOrder"]')?.textContent.trim() || '';
        const totalAmountSpan = header?.querySelector('span[data-auto-test-id="RAP2.PurchaseList.Display.Invoice.Amount"]');
        const totalAmount = totalAmountSpan?.textContent.trim() || '';
        
        // Check purchase details status
        const purchaseDetails = purchase.querySelector('div.purchase-details');
        const isFreeOrNoInvoice = purchaseDetails?.classList.contains('no-invoice');
        
        let documentNo = '', billedTo = '', billingName = '';
        
        if (!isFreeOrNoInvoice) {
          // Only expand and extract details if it's not free/no invoice
          await expandAndWaitForDetails(purchase);
          
          // Extract details from purchase details section
          documentNo = purchaseDetails?.querySelector('span[data-auto-test-id="RAP2.PurchaseList.PurchaseDetails.Display.DocumentNumber"]')?.textContent.trim() || '';
          billedTo = purchaseDetails?.querySelector('[data-auto-test-id="RAP2.PurchaseList.PurchaseDetails.Label.PaymentMethod"]')?.textContent.trim() || '';
          billingName = purchaseDetails?.querySelector('[data-auto-test-id="RAP2.PurchaseList.PurchaseDetails.Display.Name"]')?.textContent.trim() || '';
        }
        
        // Process each item in both applicable and inapplicable lists
        const allItems = [
          ...purchase.querySelectorAll('ul.pli-list.applicable-items li.pli'),
          ...purchase.querySelectorAll('ul.pli-list.inapplicable-items-but-free li.pli')
        ];

        for (const item of allItems) {
          // Item details
          const itemName = item.querySelector('div[aria-label]')?.getAttribute('aria-label')?.trim() || '';
          const publisher = item.querySelector('div.pli-publisher')?.textContent.trim() || '';
          const itemDateTime = item.querySelector('div.pli-purchase-date[data-auto-test-id="RAP2.PurchaseList.PLIDetails.Value.Date"]')?.textContent.trim() || '';
          
          // Subscription info
          const subscriptionInfo = item.querySelector('div.pli-subscription-info[data-auto-test-id*="Display.SubscriptionInfo"]')?.textContent.trim() || '';
          
          // Price (with more specific selector)
          const priceSpan = item.querySelector('div.pli-price span[data-auto-test-id*="Display.Price"]');
          let itemPrice = 'Free';
          if (priceSpan) {
            const priceText = priceSpan.textContent.trim();
            itemPrice = priceText || 'Free';
          }
          
          transactions.push({
            'Purchase Date': date,
            'Item Date & Time': itemDateTime,
            'Order ID': orderId,
            'Document Number': documentNo,
            'Item Name': itemName,
            'Publisher': publisher,
            'Item Description': subscriptionInfo,
            'Item Price': itemPrice,
            'Order Total': totalAmount,
            'Payment Method': billedTo,
            'Billing Name': billingName
          });
        }
      } catch (error) {
        console.error('Error processing purchase:', error);
        // Continue with next purchase
      }
    }
  } finally {
    // Remove progress indicator
    document.body.removeChild(progressDiv);
  }
  
  return transactions;
}

function convertToCSV(transactions) {
  if (transactions.length === 0) return '';
  
  const headers = Object.keys(transactions[0]);
  const csvRows = [];
  
  // Add headers
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of transactions) {
    const values = headers.map(header => {
      const value = row[header] || '';
      // Escape quotes and wrap in quotes if contains comma or newline
      const escaped = value.replace(/"/g, '""');
      return escaped.includes(',') || escaped.includes('\n') ? `"${escaped}"` : escaped;
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
} 