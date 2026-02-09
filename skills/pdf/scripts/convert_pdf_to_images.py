#!/usr/bin/env python3
"""Convert each page of a PDF to a PNG image. See forms.md."""

import os
import sys

try:
    from pdf2image import convert_from_path
except ImportError:
    print("Error: pdf2image not installed. Run: pip install pdf2image")
    print("Also requires poppler: brew install poppler (macOS) or apt install poppler-utils (Linux)")
    sys.exit(1)


# Max dimension in pixels for output images.
# 1000px balances readability with file size for form field analysis.
MAX_DIM = 1000

# DPI for PDF rendering. 200 gives good quality without excessive file size.
DPI = 200


def convert(pdf_path, output_dir, max_dim=MAX_DIM):
    if not os.path.exists(pdf_path):
        print(f"Error: File not found: {pdf_path}")
        sys.exit(1)

    os.makedirs(output_dir, exist_ok=True)

    try:
        images = convert_from_path(pdf_path, dpi=DPI)
    except Exception as e:
        print(f"Error: Could not convert PDF: {e}")
        print("Check that poppler is installed: brew install poppler (macOS)")
        sys.exit(1)

    for i, image in enumerate(images):
        width, height = image.size
        if width > max_dim or height > max_dim:
            scale_factor = min(max_dim / width, max_dim / height)
            new_width = int(width * scale_factor)
            new_height = int(height * scale_factor)
            image = image.resize((new_width, new_height))

        image_path = os.path.join(output_dir, f"page_{i+1}.png")
        image.save(image_path)
        print(f"Saved page {i+1} as {image_path} (size: {image.size})")

    print(f"Converted {len(images)} pages to PNG images")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: convert_pdf_to_images.py <input.pdf> <output_directory>")
        sys.exit(1)
    convert(sys.argv[1], sys.argv[2])
