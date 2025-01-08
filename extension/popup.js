// Show warning for large numbers of purchases
document.getElementById('maxPurchases').addEventListener('input', (e) => {
  const warningText = document.getElementById('warningText');
  const value = parseInt(e.target.value);
  warningText.style.display = value > 100 ? 'block' : 'none';
});

document.getElementById('exportButton').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const loading = document.getElementById('loading');
  const exportButton = document.getElementById('exportButton');
  const maxPurchases = document.getElementById('maxPurchases').value;
  
  // Validate input
  const purchaseCount = parseInt(maxPurchases);
  if (isNaN(purchaseCount) || purchaseCount < 1 || purchaseCount > 1000) {
    status.textContent = 'Please enter a number between 1 and 1000';
    return;
  }
  
  try {
    status.textContent = '';
    status.className = '';
    loading.style.display = 'block';
    exportButton.disabled = true;

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if we're on the right page
    if (!tab.url.includes('reportaproblem.apple.com')) {
      status.textContent = 'Please navigate to the Apple Report a Problem page first.';
      loading.style.display = 'none';
      exportButton.disabled = false;
      return;
    }

    // Send message to content script to start extraction
    const response = await chrome.tabs.sendMessage(tab.id, { 
      action: 'extract',
      maxPurchases: purchaseCount
    });

    if (response.success) {
      // Create and download the CSV file
      const csvContent = 'data:text/csv;charset=utf-8,' + response.csv;
      const encodedUri = encodeURI(csvContent);
      
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `apple_purchases_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      status.textContent = `Export completed successfully! Processed ${response.processedCount || purchaseCount} purchases.`;
    } else {
      const errorMessage = response.error || 'Unknown error occurred';
      if (errorMessage.includes('Page structure has changed')) {
        status.className = 'error-status';
        status.innerHTML = 'The page structure appears to have changed. This might be due to an Apple website update.<br><br>' +
          'Please <a href="https://github.com/ahhhdum/apple-subscriptions-exporter/issues" target="_blank">report this issue</a> ' +
          'so we can update the extension.';
      } else {
        status.className = 'error-status';
        status.textContent = `Error: ${errorMessage}`;
      }
      console.error('Export error:', {
        error: errorMessage,
        details: response.details,
        timestamp: new Date().toISOString(),
        version: '1.0.1',
        purchaseCount
      });
    }
  } catch (error) {
    const errorMessage = error.message || 'Unknown error occurred';
    status.className = 'error-status';
    status.textContent = `Error: ${errorMessage}`;
    console.error('Extension error:', {
      error: errorMessage,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      version: '1.0.1',
      purchaseCount
    });
  } finally {
    loading.style.display = 'none';
    exportButton.disabled = false;
  }

  // Save the last used value
  chrome.storage.local.set({ lastMaxPurchases: purchaseCount });
}); 