import sys
import os
import tempfile
import logging
from pdf2docx import Converter
from docx import Document

# Suppress debug output from pdf2docx
logging.getLogger("pdf2docx").setLevel(logging.ERROR)

def extract_text_from_docx(docx_path):
    doc = Document(docx_path)
    full_text = []
    
    # Iterate through blocks (paragraphs and tables)
    # python-docx doesn't provide a direct way to iterate everything in order easily without dropping to XML
    # But for a simple resume extraction, iterating paragraphs then tables is often okay, 
    # OR we can iterate the body elements in order
    
    # A robust way to iterate all elements in order in python-docx:
    from docx.document import Document as _Document
    from docx.oxml.text.paragraph import CT_P
    from docx.oxml.table import CT_Tbl
    from docx.table import _Cell, Table
    from docx.text.paragraph import Paragraph

    def iter_block_items(parent):
        if isinstance(parent, _Document):
            parent_elm = parent.element.body
        elif isinstance(parent, _Cell):
            parent_elm = parent._tc
        else:
            raise ValueError("Something's not right")

        for child in parent_elm.iterchildren():
            if isinstance(child, CT_P):
                yield Paragraph(child, parent)
            elif isinstance(child, CT_Tbl):
                yield Table(child, parent)

    for block in iter_block_items(doc):
        if isinstance(block, Paragraph):
            text = block.text.strip()
            if text:
                full_text.append(text)
        elif isinstance(block, Table):
            for row in block.rows:
                row_data = []
                for cell in row.cells:
                    cell_text = cell.text.strip()
                    if cell_text:
                        row_data.append(cell_text)
                if row_data:
                    # Join cell data with tabs
                    full_text.append("\t".join(row_data))
                    
    return "\n".join(full_text)

def main():
    if len(sys.argv) < 2:
        print("Usage: python convert_and_extract.py <path_to_pdf>")
        sys.exit(1)
        
    pdf_path = sys.argv[1]
    if not os.path.exists(pdf_path):
        print(f"File not found: {pdf_path}")
        sys.exit(1)
        
    # Create a temporary DOCX path
    fd, docx_path = tempfile.mkstemp(suffix=".docx")
    os.close(fd)
    
    try:
        # Convert PDF to DOCX
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()
        
        # Extract Text
        text = extract_text_from_docx(docx_path)
        
        # Output as UTF-8 string to stdout
        # Node will capture this
        sys.stdout.buffer.write(text.encode("utf-8"))
        
    except Exception as e:
        sys.stderr.write(f"Error during conversion: {str(e)}\n")
        sys.exit(1)
    finally:
        # Cleanup
        if os.path.exists(docx_path):
            os.remove(docx_path)

if __name__ == "__main__":
    main()
