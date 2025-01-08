// Listen for messages from the popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'extract') {
    extractTransactionsAsync(request.maxPurchases)
      .then(transactions => {
        const csv = convertToCSV(transactions);
        sendResponse({ success: true, csv });
      })
      .catch(error => {
        sendResponse({ success: false, error: error.message });
      });
    return true; // Required for async response
  }
});

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
          
          // Subscription info and management
          const subscriptionInfo = item.querySelector('div.pli-subscription-info[data-auto-test-id*="Display.SubscriptionInfo"]')?.textContent.trim() || '';
          const manageSubLink = item.querySelector('a.pli-manage-subscription-link[data-auto-test-id="RAP2.PurchaseList.PLI.Button.ManageSubscriptions"]')?.getAttribute('href') || '';
          
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
            'Billing Name': billingName,
            'Subscription Management': manageSubLink
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