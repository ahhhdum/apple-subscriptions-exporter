// Show warning for large numbers of purchases
document.getElementById('maxPurchases').addEventListener('input', (e) => {
  const warningText = document.getElementById('warningText');
  const value = parseInt(e.target.value);
  warningText.style.display = value > 100 ? 'block' : 'none';
});

// Handle stop button click
document.getElementById('stopButton').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const stopButton = document.getElementById('stopButton');
  
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    const response = await chrome.tabs.sendMessage(tab.id, { action: 'stopExtraction' });
    
    if (response.success) {
      status.className = 'warning-status';
      status.textContent = 'Export cancelled. Any processed purchases will be saved.';
    }
  } catch (error) {
    console.error('Error stopping extraction:', error);
  }
  
  stopButton.style.display = 'none';
});

document.getElementById('exportButton').addEventListener('click', async () => {
  const status = document.getElementById('status');
  const loading = document.getElementById('loading');
  const progressText = document.getElementById('progressText');
  const exportButton = document.getElementById('exportButton');
  const stopButton = document.getElementById('stopButton');
  const maxPurchases = document.getElementById('maxPurchases').value;
  
  // Function to handle CSV download
  const downloadCSV = (csv, prefix = '') => {
    if (!csv || typeof csv !== 'string' || csv.trim() === '') {
      console.error('Invalid or empty CSV data');
      return false;
    }
    
    try {
      const csvContent = 'data:text/csv;charset=utf-8,' + csv;
      const encodedUri = encodeURI(csvContent);
      const timestamp = new Date().toISOString().split('T')[0];
      
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `apple_purchases${prefix}_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    } catch (error) {
      console.error('Error downloading CSV:', error);
      return false;
    }
  };
  
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
    progressText.textContent = 'Initializing...';
    exportButton.disabled = true;
    stopButton.style.display = 'block';

    // Get the active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    // Check if we're on the right page
    if (!tab.url.includes('reportaproblem.apple.com')) {
      status.textContent = 'Please navigate to the Apple Report a Problem page first.';
      loading.style.display = 'none';
      exportButton.disabled = false;
      stopButton.style.display = 'none';
      return;
    }

    // Send message to content script to start extraction
    const response = await chrome.tabs.sendMessage(tab.id, { 
      action: 'extract',
      maxPurchases: purchaseCount
    });

    if (!response) {
      throw new Error('No response from content script');
    }

    // Ensure response has required properties
    const processedCount = response.processedCount || 0;
    const csv = response.csv || '';

    if (response.success) {
      if (processedCount === 0) {
        status.className = 'warning-status';
        status.textContent = 'No purchases were found to process.';
      } else if (downloadCSV(csv)) {
        status.className = 'success-status';
        status.textContent = `Export completed successfully! Processed ${processedCount} purchases.`;
      } else {
        throw new Error('Failed to download CSV file');
      }
    } else if (response.wasCancelled) {
      if (processedCount > 0 && csv) {
        if (downloadCSV(csv, '_partial')) {
          status.className = 'warning-status';
          status.textContent = `Export cancelled. Downloaded ${processedCount} processed purchases.`;
        } else {
          status.className = 'error-status';
          status.textContent = 'Failed to download partial results.';
        }
      } else {
        status.className = 'warning-status';
        status.textContent = 'Export cancelled. No purchases were processed.';
      }
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
        version: '1.0.3',
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
      version: '1.0.3',
      purchaseCount
    });
  } finally {
    loading.style.display = 'none';
    exportButton.disabled = false;
    stopButton.style.display = 'none';
  }

  // Save the last used value
  chrome.storage.local.set({ lastMaxPurchases: purchaseCount });
}); 