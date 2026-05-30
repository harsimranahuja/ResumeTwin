"""
Quick test: Check if a ResumeTwin PDF contains the expected metadata fields.
Usage: python test_pdf_metadata.py <path_to_pdf>
"""
import sys
import fitz  # PyMuPDF

if len(sys.argv) < 2:
    print("Usage: python test_pdf_metadata.py <path_to_pdf>")
    sys.exit(1)

pdf_path = sys.argv[1]
doc = fitz.open(pdf_path)
metadata = doc.metadata

print("=== PDF Metadata ===")
for key, value in metadata.items():
    val_preview = str(value)[:200] if value else "(empty)"
    print(f"  {key}: {val_preview}")

print()

if metadata.get("keywords") == "resumetwin-metadata":
    print("✅ This is a ResumeTwin PDF (keywords match)")
    if metadata.get("subject"):
        print(f"✅ Subject field has {len(metadata['subject'])} chars of data")
    else:
        print("❌ Subject field is EMPTY - metadata was not embedded properly")
else:
    print(f"❌ Not a ResumeTwin PDF. Keywords = '{metadata.get('keywords', '(none)')}'")

doc.close()
