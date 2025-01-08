// Version of the structure definition
const STRUCTURE_VERSION = '1.0.1';

// Critical selectors that must be present for the extension to work
const CRITICAL_SELECTORS = {
  // Main purchase container
  purchase: {
    selector: 'div.purchase.loaded',
    required: true,
    attributes: ['class'],
    classes: ['purchase', 'loaded']
  },

  // Purchase header
  purchaseHeader: {
    selector: 'h3.purchase-header',
    required: true,
    dataAttributes: ['data-auto-test-id="RAP2.PurchaseList.PurchaseHeader.Label"']
  },

  // Date field
  date: {
    selector: 'span[data-auto-test-id="RAP2.PurchaseList.PurchaseHeader.Display.Date"]',
    required: true,
    dataAttributes: ['data-auto-test-id']
  },

  // Order ID
  orderId: {
    selector: 'span[data-auto-test-id="RAP2.PurchaseList.PurchaseHeader.Display.WebOrder"]',
    required: true,
    dataAttributes: ['data-auto-test-id']
  },

  // Purchase details
  purchaseDetails: {
    selector: 'div.purchase-details',
    required: true,
    attributes: ['class'],
    classes: ['purchase-details']
  },

  // Item list
  itemList: {
    selector: 'ul.pli-list',
    required: true,
    attributes: ['class'],
    classes: ['pli-list']
  },

  // Individual item
  item: {
    selector: 'li.pli',
    required: true,
    attributes: ['class'],
    classes: ['pli']
  },

  // Price display
  price: {
    selector: 'div.pli-price span[data-auto-test-id*="Display.Price"]',
    required: true,
    dataAttributes: ['data-auto-test-id']
  }
};

// Expected content patterns
const CONTENT_PATTERNS = {
  date: {
    // Matches patterns like: "Dec 31, 2024" or "January 1, 2024"
    pattern: /^[A-Z][a-z]{2,8}\s+\d{1,2},\s+\d{4}$/,
    required: true
  },
  orderId: {
    // Matches patterns like: "MS71XHJJ3K"
    pattern: /^[A-Z0-9]{10}$/,
    required: true
  },
  price: {
    // Matches patterns like: "$9.99", "Free", "$0.00"
    pattern: /^(\$\d+\.\d{2}|Free)$/,
    required: true
  }
};

// Export the definitions
export {
  STRUCTURE_VERSION,
  CRITICAL_SELECTORS,
  CONTENT_PATTERNS
}; 