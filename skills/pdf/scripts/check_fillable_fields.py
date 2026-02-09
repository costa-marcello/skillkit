#!/usr/bin/env python3
"""Check whether a PDF has fillable form fields. See forms.md."""

import sys
from pypdf import PdfReader


def check_fillable(pdf_path: str) -> bool:
    """Return True if the PDF has fillable form fields."""
    try:
        reader = PdfReader(pdf_path)
    except FileNotFoundError:
        print(f"Error: File not found: {pdf_path}")
        sys.exit(1)
    except Exception as e:
        print(f"Error: Could not read PDF: {e}")
        sys.exit(1)

    if reader.get_fields():
        print("This PDF has fillable form fields")
        return True
    else:
        print("This PDF does not have fillable form fields; you will need to visually determine where to enter data")
        return False


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: check_fillable_fields.py <input.pdf>")
        sys.exit(1)
    check_fillable(sys.argv[1])
