import os
import re
from typing import List, Dict, Any, Tuple
from app.rag.schemas import DocumentProcessInput, DocumentProcessResult, DocumentChunkData

def clean_text(text: str) -> str:
    """
    Cleans document text by removing repeated whitespace, control characters,
    and broken line endings while preserving headings, paragraph breaks, and lists.
    """
    if not text:
        return ""
    
    # Remove null bytes and control chars (except newline and tab)
    text = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', text)
    
    # Normalize carriage returns
    text = text.replace('\r\n', '\n').replace('\r', '\n')
    
    # Remove excessive blank lines (more than 2 consecutive newlines)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Replace multiple spaces/tabs within a single line with a single space
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    
    return '\n'.join(lines).strip()

def extract_pdf_text(file_path: str) -> List[Tuple[int, str]]:
    """
    Extracts text page-by-page from PDF files.
    """
    pages_text = []
    try:
        import pypdf
        reader = pypdf.PdfReader(file_path)
        for idx, page in enumerate(reader.pages):
            txt = page.extract_text() or ""
            pages_text.append((idx + 1, clean_text(txt)))
    except Exception as e:
        # Fallback using PyPDF2 or raw regex if pypdf is unavailable
        try:
            import PyPDF2
            reader = PyPDF2.PdfReader(file_path)
            for idx, page in enumerate(reader.pages):
                txt = page.extract_text() or ""
                pages_text.append((idx + 1, clean_text(txt)))
        except Exception:
            with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                content = clean_text(f.read())
                pages_text.append((1, content))
    return pages_text

def extract_docx_text(file_path: str) -> List[Tuple[int, str]]:
    """
    Extracts text from DOCX files preserving paragraph and heading structure.
    """
    pages_text = []
    try:
        import docx
        doc = docx.Document(file_path)
        full_text = []
        for para in doc.paragraphs:
            if para.text.strip():
                if para.style.name.startswith('Heading'):
                    full_text.append(f"\n### {para.text.strip()}\n")
                else:
                    full_text.append(para.text.strip())
        
        content = clean_text('\n'.join(full_text))
        pages_text.append((1, content))
    except Exception:
        with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
            content = clean_text(f.read())
            pages_text.append((1, content))
    return pages_text

def extract_plain_text(file_path: str) -> List[Tuple[int, str]]:
    """
    Extracts text from TXT and Markdown files.
    """
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = clean_text(f.read())
    return [(1, content)]

def process_document_file(input_data: DocumentProcessInput) -> DocumentProcessResult:
    """
    Reads, extracts, and cleans document text according to file extension.
    Returns page count, word count, and extracted page blocks.
    """
    file_path = input_data.filePath
    file_ext = os.path.splitext(file_path)[1].lower() or f".{input_data.fileType.lower()}"

    if not os.path.exists(file_path):
        return DocumentProcessResult(
            documentId=input_data.documentId,
            status="FAILED",
            pageCount=0,
            wordCount=0,
            chunksCount=0,
            errorMessage=f"File path '{file_path}' does not exist on disk."
        )

    try:
        if file_ext in ['.pdf']:
            pages = extract_pdf_text(file_path)
        elif file_ext in ['.docx', '.doc']:
            pages = extract_docx_text(file_path)
        elif file_ext in ['.txt', '.md', '.markdown']:
            pages = extract_plain_text(file_path)
        else:
            return DocumentProcessResult(
                documentId=input_data.documentId,
                status="FAILED",
                pageCount=0,
                wordCount=0,
                chunksCount=0,
                errorMessage=f"Unsupported file type '{file_ext}'. Supported: PDF, DOCX, TXT, MD."
            )

        total_words = sum(len(txt.split()) for _, txt in pages if txt)
        total_pages = max(len(pages), 1)

        return DocumentProcessResult(
            documentId=input_data.documentId,
            status="READY",
            pageCount=total_pages,
            wordCount=total_words,
            chunksCount=0,
            chunks=[]
        )
    except Exception as e:
        return DocumentProcessResult(
            documentId=input_data.documentId,
            status="FAILED",
            pageCount=0,
            wordCount=0,
            chunksCount=0,
            errorMessage=f"Text extraction error: {str(e)}"
        )
