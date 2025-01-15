# Testing Workflow for Apple Subscriptions Exporter

## Development Mode Setup

1. Create a development copy of the extension:
   ```bash
   cp -r extension extension-dev
   ```
2. Modify manifest.json in the dev version:
   - Change version to include "-dev" (e.g., "1.0.2-dev")
   - This enables detailed console logging

3. Load dev version in Chrome:
   - Go to chrome://extensions/
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the extension-dev folder
   - Note: You can keep both prod and dev versions installed simultaneously

4. Debug Setup:
   - Open Chrome DevTools (F12)
   - Go to Sources tab
   - If script shows "This script is on the debugger's ignore list", click "Remove from ignore list"
   - Set breakpoints as needed for debugging

## Basic Functionality Tests

### Initial Setup
1. Navigate to https://reportaproblem.apple.com
2. Sign in with your Apple ID
3. Wait for the purchase history to load initially
4. Open Chrome DevTools console to monitor logs (in dev mode)

### Test Case 1: Small Export (Default Settings)
1. Click the extension icon
2. Verify default value is 50 in the input field
3. Click "Export Purchases"
4. Expected:
   - Progress indicator shows "Initializing..."
   - Stop button appears
   - Export button is disabled
   - Page scrolls automatically to load purchases
   - CSV downloads upon completion
   - Success message shows number of processed items

### Test Case 2: Large Export (>100 items)
1. Enter 200 in the input field
2. Verify warning message appears about longer processing time
3. Click "Export Purchases"
4. Expected:
   - Warning message visible
   - All progress indicators working
   - Stall detection working if no new items load
   - Final CSV contains up to 200 items or maximum available

### Test Case 3: Cancellation
1. Enter 500 in the input field
2. Click "Export Purchases"
3. Wait for processing to begin
4. Click "Stop Export" button
5. Expected:
   - Export process stops
   - Warning message about cancellation appears
   - CSV downloads with partially processed data
   - Shows correct count of processed items
   - UI returns to initial state

## Error Handling Tests

### Test Case 4: Invalid Input
1. Try entering 0 purchases
2. Try entering 1001 purchases
3. Try entering negative numbers
4. Expected:
   - Error message for each invalid input
   - Export button functionality blocked
   - Clear error messaging

### Test Case 5: Page Navigation
1. Open extension on wrong page (not reportaproblem.apple.com)
2. Click "Export Purchases"
3. Expected:
   - Clear error message about incorrect page
   - No processing starts

### Test Case 6: Stall Detection
1. Enter 250 purchases
2. Start export
3. If page stalls (no new items loaded):
   - Should see warning in console about stall detection
   - Should return partial results after 3 failed attempts
   - Should show appropriate message to user
   - Should download CSV with processed items up to that point

## Edge Cases

### Test Case 7: Network Issues
1. Simulate slow network (using Chrome DevTools)
2. Start export with 50 items
3. Expected:
   - Longer timeouts handled gracefully
   - Appropriate error messages
   - No UI freezing
   - Partial data saved if process fails

### Test Case 8: Free Items and No Receipts
1. Process purchases including free items
2. Expected:
   - Free items marked correctly in CSV
   - No-receipt items handled properly
   - All item types exported correctly

### Test Case 9: Multiple Attempts
1. Run multiple exports in succession
2. Expected:
   - Each new export cancels any ongoing export
   - Clean state between exports
   - No memory leaks or performance degradation

## Visual Feedback Tests

### Test Case 10: Progress Indicators
1. Start a medium-sized export (100 items)
2. Verify:
   - Loading indicator visible
   - Progress text updates
   - Status messages clear and accurate
   - Color coding correct (blue for processing, green for success, red for errors, orange for warnings)
   - Stop button appears during processing
   - Stop button disappears after completion/cancellation

## Post-Export Validation

### Test Case 11: CSV Data Quality
1. Open exported CSV file
2. Verify all columns present:
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
3. Check data formatting:
   - Dates in correct format
   - Currency symbols preserved
   - Special characters handled properly
   - No missing required fields
4. For partial exports:
   - Verify filename includes '_partial'
   - Verify data is complete up to cancellation point

## Regression Testing

### Test Case 12: Version Compatibility
1. Test with latest Chrome version
2. Verify all features working after Chrome updates
3. Check console for any deprecation warnings

## Notes
- Document any failures or unexpected behavior
- Note Chrome version and OS for any issues
- Include screenshots of errors when reporting issues
- Test with different Apple ID purchase histories if possible
- When testing cancellation, try at different points in the process
- Monitor console logs in dev mode for detailed debugging information 