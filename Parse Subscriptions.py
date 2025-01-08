from bs4 import BeautifulSoup

# Load your HTML content into a string
with open('Sample HTML.html', 'r', encoding='utf-8') as file:
    html_content = file.read()

# Parse the HTML
soup = BeautifulSoup(html_content, 'html.parser')

print("Starting to parse HTML...")

# Extract user information
username_div = soup.find('div', class_='app-username')
username = username_div.text.strip() if username_div else "Unknown User"
print(f"Found user: {username}")

# Find the purchases container
purchases_div = soup.find('div', class_='purchases empty')
if not purchases_div:
    print("Error: Could not find purchases container")
    exit(1)

# Extract total results count if available
results_span = purchases_div.find('span', class_='result-found')
if results_span:
    print(f"Results count: {results_span.text}")

# Extract data
transactions = []

# Find all transactions
purchases = purchases_div.find_all('div', class_='purchase loaded collapsed')
print(f"Found {len(purchases)} purchases")

for purchase in purchases:
    # Clean up date by removing extra whitespace and newlines
    date = ' '.join(purchase.find('span', class_='invoice-date').text.split())
    transaction_id = purchase.find('span', attrs={'data-auto-test-id': lambda x: x and 'PurchaseHeader.Display.WebOrder' in x}).text.strip()
    
    # Get total amount for the purchase if available
    total_amount_span = purchase.find('span', attrs={'data-auto-test-id': 'RAP2.PurchaseList.Display.Invoice.Amount'})
    total_amount = total_amount_span.text.strip() if total_amount_span else ''
    
    print(f"\nProcessing purchase from {date} with ID {transaction_id} (Total: {total_amount})")
    
    # Iterate over items in the transaction
    items = purchase.find_all('li', class_='pli')
    print(f"Found {len(items)} items in this purchase")
    
    for item in items:
        # Item name is in a div with aria-label
        item_name = item.find('div', attrs={'aria-label': True}).get('aria-label', '').strip()
        
        # Publisher info - clean up whitespace
        publisher_div = item.find('div', class_='pli-publisher')
        publisher = ' '.join(publisher_div.text.split()) if publisher_div else ''
        
        # Subscription info (if available)
        subscription_info = item.find('div', class_='pli-subscription-info')
        description = ' '.join(subscription_info.text.split()) if subscription_info else ''
        
        # Price - handle both regular price and "Free" cases
        price_tag = item.find('span', attrs={'data-auto-test-id': lambda x: x and 'Price' in x})
        if price_tag:
            # Check if there's a nested "Free" span
            free_span = price_tag.find('span', attrs={'data-auto-test-id': 'RAP2.PurchaseList.PLI.Label.Free'})
            price = 'Free' if free_span else price_tag.text.strip()
        else:
            price = 'Free'
            
        print(f"  - Item: {item_name}")
        print(f"    Publisher: {publisher}")
        print(f"    Price: {price}")

        transactions.append({
            'Date': date,
            'Transaction ID': transaction_id,
            'Total Amount': total_amount,
            'Item Name': item_name,
            'Publisher': publisher,
            'Description': description,
            'Price': price
        })

print(f"\nTotal transactions found: {len(transactions)}")

# Output the results
import pandas as pd

df = pd.DataFrame(transactions)
df.to_csv('transactions.csv', index=False)
print("Data extracted and saved to 'transactions.csv'.")
