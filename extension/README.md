# Apple Subscriptions Exporter Chrome Extension

A Chrome extension that allows you to export your Apple subscription history to CSV format.

## Features

- Export your entire Apple subscription history
- Includes transaction dates, IDs, amounts, and item details
- Downloads directly as a CSV file
- Works with any Apple ID account
- Privacy-focused: processes data locally, no external servers

## Installation for Development

1. Clone this repository or download the extension folder
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

## Usage

1. Log in to your Apple account and navigate to your subscriptions page:
   - https://apps.apple.com/account/subscriptions
2. Click the extension icon in your Chrome toolbar
3. Click "Export Subscriptions"
4. The CSV file will automatically download to your computer

## CSV Format

The exported CSV includes the following columns:
- Date
- Transaction ID
- Total Amount
- Item Name
- Publisher
- Description
- Price

## Privacy

This extension:
- Only runs on the Apple subscriptions page
- Processes all data locally in your browser
- Does not send any data to external servers
- Requires minimal permissions

## Development

The extension consists of:
- `manifest.json`: Extension configuration
- `popup.html/js`: User interface
- `content.js`: Page parsing logic
- Icons in various sizes

## License

MIT License - Feel free to modify and distribute as needed. 