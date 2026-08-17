import re
from typing import List, Tuple
from app.rag.schemas import DocumentChunkData

DEFAULT_CHUNK_SIZE = 500
DEFAULT_CHUNK_OVERLAP = 50

def chunk_document_text(
    pages_text: List[Tuple[int, str]],
    chunk_size: int = DEFAULT_CHUNK_SIZE,
    chunk_overlap: int = DEFAULT_CHUNK_OVERLAP
) -> List[DocumentChunkData]:
    """
    Splits page-by-page document text into paragraph-aware chunks with overlap.
    Preserves heading context and page numbers.
    """
    chunks = []
    chunk_index = 0

    for page_num, text in pages_text:
        if not text.strip():
            continue

        paragraphs = text.split('\n\n')
        current_chunk_text = ""
        current_heading = "General"
        current_section = "General"

        for para in paragraphs:
            para_clean = para.strip()
            if not para_clean:
                continue

            # Detect headings
            if para_clean.startswith('#') or para_clean.isupper() and len(para_clean) < 60:
                current_heading = para_clean.lstrip('#').strip()
                current_section = current_heading

            # If adding paragraph exceeds chunk_size and we already have content, emit current chunk
            if len(current_chunk_text) + len(para_clean) > chunk_size and len(current_chunk_text) > 50:
                words_count = len(current_chunk_text.split())
                chunks.append(DocumentChunkData(
                    chunkIndex=chunk_index,
                    content=current_chunk_text.strip(),
                    tokenCount=int(words_count * 1.3),
                    pageNumber=page_num,
                    section=current_section,
                    heading=current_heading
                ))
                chunk_index += 1

                # Keep overlap from end of previous chunk
                overlap_text = current_chunk_text[-chunk_overlap:] if len(current_chunk_text) > chunk_overlap else ""
                current_chunk_text = overlap_text + "\n" + para_clean
            else:
                if current_chunk_text:
                    current_chunk_text += "\n\n" + para_clean
                else:
                    current_chunk_text = para_clean

        # Emit remaining text on page
        if current_chunk_text.strip():
            words_count = len(current_chunk_text.split())
            chunks.append(DocumentChunkData(
                chunkIndex=chunk_index,
                content=current_chunk_text.strip(),
                tokenCount=int(words_count * 1.3),
                pageNumber=page_num,
                section=current_section,
                heading=current_heading
            ))
            chunk_index += 1

    return chunks
