#!/bin/bash
# Convert PNG screenshots to WebP for production.
# Requires: cwebp (from libwebp-tools) or ImageMagick
# After running, update index.html references from .png to .webp

set -e

SCREENSHOTS_DIR="img/screenshots"

if command -v cwebp &>/dev/null; then
    for f in "$SCREENSHOTS_DIR"/*.png; do
        [ -f "$f" ] || continue
        out="${f%.png}.webp"
        echo "Converting $f -> $out"
        cwebp -q 80 "$f" -o "$out"
    done
elif command -v convert &>/dev/null; then
    for f in "$SCREENSHOTS_DIR"/*.png; do
        [ -f "$f" ] || continue
        out="${f%.png}.webp"
        echo "Converting $f -> $out"
        convert "$f" -quality 80 "$out"
    done
else
    echo "Error: No image conversion tool found. Install libwebp-tools or ImageMagick."
    exit 1
fi

echo "Done. Now update index.html: sed -i 's/\.png/.webp/g' index.html"
