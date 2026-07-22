#!/usr/bin/bash

set -e

# Patch commit script for @payloadcms/plugin-ecommerce:3.85.2

cd source && pnpm patch-commit "C:\Users\wests\OneDrive\Desktop\WP\WEARJMK\source\patches" && cd ../