#!/bin/bash

# PayPal Environment Variables Setup Script
# This script adds PayPal credentials to your .env file

ENV_FILE=".env"

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating .env file..."
    touch "$ENV_FILE"
fi

# Check if PayPal credentials already exist
if grep -q "PAYPAL_CLIENT_ID" "$ENV_FILE"; then
    echo "PayPal credentials already exist in .env file"
    echo "Please manually update them or remove the old entries first"
    exit 1
fi

# Add PayPal credentials
echo "" >> "$ENV_FILE"
echo "# PayPal Payment Gateway Configuration" >> "$ENV_FILE"
echo "PAYPAL_CLIENT_ID=AcnpbvL-nqay69eboBK-a2hcQLnkFTQZXbTF0f4UafVwhRYAXe11Z0B3PtFyWCTDH24INY6Cu2U0rhRC" >> "$ENV_FILE"
echo "PAYPAL_CLIENT_SECRET=EGZXWncK71BKAfqH7ClPpldekK6kSKvO9yIk0Loz36CkdM7uLC_vuE5mjbGjRhJhBT5BeOYyBB-_p6WW" >> "$ENV_FILE"
echo "PAYPAL_MODE=sandbox" >> "$ENV_FILE"
echo "PAYPAL_API_BASE_URL=https://api-m.sandbox.paypal.com" >> "$ENV_FILE"

echo "PayPal credentials have been added to .env file successfully!"
echo "Please restart your backend server for the changes to take effect."
