#!/bin/sh

PUBLIC_KEY="age19u7rmnq50685pq0v2jg5fyzxec4lxh3h3v8n9u9yxhgk7vsth34sppxcm8"

SCRIPT_DIR=$(dirname "${BASH_SOURCE[0]}")

source "$SCRIPT_DIR/secrets-files.sh"

PRIVATE_KEY_FILE="$SCRIPT_DIR/../key.txt"

# Loop through each file and encrypt it
for file in "${files[@]}"; do
  age -d -i "$PRIVATE_KEY_FILE" -o "$file" "${file}.secret"
done
