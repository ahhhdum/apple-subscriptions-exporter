# Apple Purchase History Exporter

A Chrome extension that helps you export your Apple purchase history from the Report a Problem page to CSV format.

## Features

- Export purchase history to CSV with detailed information
- Configurable number of purchases to process (1-1000)
- Progress indicator while processing
- Automatic page structure validation
- Human-like interaction to prevent detection
- Error handling with detailed feedback

## Installation

### From Chrome Web Store
*(Coming soon)*

### Manual Installation
1. Download the latest release from the [releases page](https://github.com/ahhhdum/apple-subscriptions-exporter/releases)
2. Unzip the downloaded file
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" in the top right
5. Click "Load unpacked" and select the unzipped extension folder

## Usage

1. Go to [Apple's Report a Problem page](https://reportaproblem.apple.com)
2. Click the extension icon in your Chrome toolbar
3. Enter the number of purchases you want to process (default: 50)
4. Click "Export Purchases"
5. Wait for the process to complete
6. The CSV file will be downloaded automatically

### CSV Columns

- Purchase Date
- Item Date & Time
- Order ID
- Document Number
- Item Name
- Publisher
- Item Description
- Item Price
- Order Total
- Payment Method
- Billing Name

## Development

1. Clone the repository
2. Make your changes
3. Test the extension locally using Chrome's "Load unpacked" feature
4. Submit a pull request with your changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Issues

If you encounter any problems or have suggestions, please [create an issue](https://github.com/ahhhdum/apple-subscriptions-exporter/issues).

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 