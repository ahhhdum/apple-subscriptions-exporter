# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.3] - 2025-01-15

### Added
- Export cancellation functionality with "Stop Export" button
- Partial data download support when export is cancelled
- Debug logging infrastructure for development mode
- Progress indicator shows number of processed items

### Changed
- Improved stall detection with better timeout handling
- Enhanced error handling and user feedback
- Better handling of partial exports with '_partial' suffix in filename

### Fixed
- Issue with infinite scroll stalling
- Missing transaction data in cancelled exports
- Progress indicator accuracy

### Documentation
- Added detailed development mode testing instructions
- Updated testing workflow with cancellation scenarios
- Added debug logging documentation

## [1.0.2] - 2024-01-08

### Added
- Progress indicator while processing purchases
- Random delays between actions to prevent detection
- Visual feedback when expanding purchase details
- Direct link to report issues when validation fails

### Changed
- Made date field optional for free purchases
- Updated selectors to be more resilient to page changes
- Improved error handling with clearer messages
- Removed subscription management column for simplicity

### Documentation
- Updated README with detailed CSV column information
- Improved installation and usage instructions
- Added comprehensive version history
- Separated CHANGELOG from README

## [1.0.1] - 2024-01-07

### Added
- Support for large exports
- Initial error handling improvements

### Changed
- Updated extension description
- Improved code organization

## [1.0.0] - 2024-01-07

### Added
- Initial release
- Basic export functionality
- CSV download capability
- Page structure validation
- Support for both paid and free purchases
- Configurable number of purchases to export 