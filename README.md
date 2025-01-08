# Apple Subscriptions Exporter

A Chrome extension to export your Apple purchase and subscription history to CSV format.

## Features

- Export Apple purchase history to CSV
- Configurable number of purchases to export (1-1000)
- Handles both paid and free purchases
- Extracts detailed information including:
  - Purchase dates and times
  - Order IDs and document numbers
  - Item names and publishers
  - Prices and total amounts
  - Payment methods
  - Subscription management links

## Installation

1. Download the latest release from the [releases page](https://github.com/ahhhdum/apple-subscriptions-exporter/releases)
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the downloaded extension folder

Or install from the Chrome Web Store (coming soon)

## Usage

1. Go to [Apple's Report a Problem page](https://reportaproblem.apple.com)
2. Click the extension icon in your Chrome toolbar
3. Enter the number of purchases you want to export (default: 50)
4. Click "Export Purchases"
5. Wait for the process to complete
6. Your purchases will be saved as a CSV file

## Notes

- Processing large numbers of purchases may take several minutes
- Keep the page open during export
- Free items and items without receipts are included but may have limited information
- The extension requires access to reportaproblem.apple.com only

## Development

To work on the extension:

1. Clone the repository
```bash
git clone https://github.com/ahhhdum/apple-subscriptions-exporter.git
```

2. Make your changes

3. Test the extension:
   - Go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension folder

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Issues and Feature Requests

Please use the [GitHub issue tracker](https://github.com/ahhhdum/apple-subscriptions-exporter/issues) to:
- Report bugs
- Request features
- Get help with the extension

## Privacy

This extension:
- Only accesses the Apple Report a Problem page
- Does not collect any personal information
- Processes all data locally in your browser
- Does not send data to any external servers

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Version History

- v1.0.1 - Added support for large exports, improved error handling
- v1.0.0 - Initial release 