import { GoogleGenAI } from '@google/genai';
import * as pdfImport from 'pdf-parse';
const pdf = ((pdfImport as any).default || pdfImport) as any;
import mammoth from 'mammoth';
import AdmZip from 'adm-zip';
import { 
  saveDocument, 
  saveDocumentChunk, 
  indexingProgress, 
  IndexedDocument, 
  DocumentChunk, 
  getExistingDocumentChunks,
  getDocuments 
} from './vectorDb';

// Simple text cleaner
function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n\s*\n+/g, '\n\n')
    .trim();
}

// Text chunker with semantic boundaries (e.g. spaces) and overlap
export function chunkTextContent(text: string, chunkSize = 1000, overlap = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  
  if (text.length <= chunkSize) {
    return [text];
  }

  while (i < text.length) {
    let end = i + chunkSize;
    if (end < text.length) {
      // Find closest whitespace or paragraph end to avoid word/sentence splitting
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > i + chunkSize - 150) {
        end = lastSpace;
      }
    }
    chunks.push(text.substring(i, end).trim());
    i = end - overlap;
    if (i >= text.length - overlap) {
      break;
    }
  }
  return chunks.filter(c => c.length > 15);
}

// PDF Text Extractor (maps chunks to page numbers)
async function extractPdfText(buffer: Buffer): Promise<{ pageNumber: number; text: string }[]> {
  try {
    const data = await pdf(buffer);
    const rawText = data.text;
    const pages = rawText.split('\f').map(p => p.trim()).filter(Boolean);
    
    if (pages.length <= 1) {
      // Try mapping pages by parsing standard layout structure or fallback to 1 page
      return [{ pageNumber: 1, text: cleanText(rawText) }];
    }
    
    return pages.map((text, i) => ({
      pageNumber: i + 1,
      text: cleanText(text)
    }));
  } catch (err: any) {
    console.error('[PdfParser] Error parsing PDF text:', err);
    throw new Error(`Failed to parse PDF: ${err.message}`);
  }
}

// DOCX Text Extractor (maps chunks to headings)
async function extractDocxText(buffer: Buffer): Promise<{ heading: string; text: string }[]> {
  try {
    // Standard Mammoth conversion
    const htmlResult = await mammoth.convertToHtml({ buffer });
    const html = htmlResult.value;

    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    const sections: { heading: string; text: string }[] = [];
    
    let lastIndex = 0;
    let currentHeading = 'Introduction';
    let match;

    while ((match = headingRegex.exec(html)) !== null) {
      const sectionText = html.substring(lastIndex, match.index)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (sectionText.length > 10) {
        sections.push({ heading: currentHeading, text: cleanText(sectionText) });
      }

      currentHeading = match[2].replace(/<[^>]*>/g, '').trim() || 'Section';
      lastIndex = headingRegex.lastIndex;
    }

    const remainingText = html.substring(lastIndex)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (remainingText.length > 10) {
      sections.push({ heading: currentHeading, text: cleanText(remainingText) });
    }

    if (sections.length === 0) {
      const rawTextResult = await mammoth.extractRawText({ buffer });
      return [{ heading: 'Main Document Content', text: cleanText(rawTextResult.value) }];
    }

    return sections;
  } catch (err: any) {
    console.error('[DocxParser] Error parsing DOCX text:', err);
    throw new Error(`Failed to parse DOCX: ${err.message}`);
  }
}

// PPTX Text Extractor (maps slide content to Slide Numbers)
async function extractPptxText(buffer: Buffer): Promise<{ slideNumber: number; text: string }[]> {
  try {
    const zip = new AdmZip(buffer);
    const zipEntries = zip.getEntries();
    const slides: { slideNumber: number; text: string }[] = [];

    for (const entry of zipEntries) {
      if (entry.entryName.startsWith('ppt/slides/slide') && entry.entryName.endsWith('.xml')) {
        const match = entry.entryName.match(/slide(\d+)\.xml/);
        if (match) {
          const slideNumber = parseInt(match[1], 10);
          const xmlText = entry.getData().toString('utf8');
          const textMatches = [...xmlText.matchAll(/<a:t[^>]*>([\s\S]*?)<\/a:t>/g)];
          const slideText = textMatches
            .map(m => m[1]
              .replace(/&amp;/g, '&')
              .replace(/&quot;/g, '"')
              .replace(/&#39;/g, "'")
              .replace(/&lt;/g, '<')
              .replace(/&gt;/g, '>')
              .trim()
            )
            .filter(Boolean)
            .join(' ');

          if (slideText) {
            slides.push({ slideNumber, text: cleanText(slideText) });
          }
        }
      }
    }

    if (slides.length === 0) {
      return [{ slideNumber: 1, text: 'Blank Presentation slide' }];
    }

    slides.sort((a, b) => a.slideNumber - b.slideNumber);
    return slides;
  } catch (err: any) {
    console.error('[PptxParser] Error parsing PPTX presentation:', err);
    throw new Error(`Failed to parse PPTX: ${err.message}`);
  }
}

// Website URL Text Extractor (maps content to nearest HTML headings)
async function extractUrlText(url: string): Promise<{ heading: string; text: string }[]> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      throw new Error(`Failed to load URL: ${res.statusText}`);
    }

    const html = await res.text();
    // Strip headers, scripts, styles, navigations, footers to extract clean core page text
    const cleanHtml = html
      .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, '')
      .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, '')
      .replace(/<nav[^>]*>([\s\S]*?)<\/nav>/gi, '')
      .replace(/<footer[^>]*>([\s\S]*?)<\/footer>/gi, '')
      .replace(/<header[^>]*>([\s\S]*?)<\/header>/gi, '');

    const headingRegex = /<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi;
    const sections: { heading: string; text: string }[] = [];
    
    let lastIndex = 0;
    let currentHeading = 'General Information';
    let match;

    while ((match = headingRegex.exec(cleanHtml)) !== null) {
      const sectionText = cleanHtml.substring(lastIndex, match.index)
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      if (sectionText.length > 25) {
        sections.push({ heading: currentHeading, text: cleanText(sectionText) });
      }

      currentHeading = match[2].replace(/<[^>]*>/g, '').trim() || 'Section';
      lastIndex = headingRegex.lastIndex;
    }

    const remainingText = cleanHtml.substring(lastIndex)
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (remainingText.length > 25) {
      sections.push({ heading: currentHeading, text: cleanText(remainingText) });
    }

    if (sections.length === 0) {
      const rawText = cleanHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      return [{ heading: 'Main Page Content', text: cleanText(rawText) }];
    }

    return sections;
  } catch (err: any) {
    console.error('[UrlParser] Error extracting website URL content:', err);
    throw new Error(`Failed to fetch and parse website URL: ${err.message}`);
  }
}

// Generate an embedding for a chunk using Gemini with robust exponential backoff retry loop
async function getEmbeddingWithRetry(ai: GoogleGenAI, text: string, retries = 3): Promise<number[]> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-2-preview',
        contents: text,
      });
      const responseAny = response as any;
      const embedding = responseAny.embedding?.values || responseAny.embeddings?.[0]?.values;
      if (embedding) {
        return embedding;
      }
      throw new Error('Empty embedding response from Google GenAI');
    } catch (err: any) {
      console.warn(`[Embedding] Attempt ${attempt} failed for chunk (text len: ${text.length}): ${err.message}`);
      if (attempt === retries) {
        throw err;
      }
      // Wait exponentially
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  throw new Error('Failed to generate embedding after retries');
}

// Generate suggested questions for the indexed content
async function generateSuggestedQuestions(ai: GoogleGenAI, docTitle: string, docSampleText: string): Promise<string[]> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate a JSON array containing exactly 4 insightful, specific suggested follow-up questions a user could ask to study, analyze, or learn from a document titled "${docTitle}".
Sample content from the document:
"""
${docSampleText.slice(0, 1500)}
"""
Generate ONLY the raw JSON string of a string array, with no markdown codeblocks or surrounding text. Example output structure: ["Question 1", "Question 2", "Question 3", "Question 4"]`,
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.slice(0, 5);
    }
  } catch (err) {
    console.warn('[Indexer] Failed to generate AI suggestions, using fallbacks:', err);
  }
  // Fallbacks
  return [
    `Summarize the key insights of "${docTitle}"`,
    `Explain the most important formulas or concepts in "${docTitle}"`,
    `List action items or practical checklists from "${docTitle}"`,
    `Create a multiple-choice practice quiz from "${docTitle}"`,
  ];
}

// Main background indexing handler
export async function runDocumentIndexing(
  ai: GoogleGenAI,
  userId: string,
  workspaceId: string,
  docParams: {
    documentId: string;
    title: string;
    sourceType: IndexedDocument['sourceType'];
    sourceUrl?: string;
    buffer?: Buffer;
    rawTextContent?: string;
  }
): Promise<void> {
  const { documentId, title, sourceType, sourceUrl, buffer, rawTextContent } = docParams;
  const progressKey = `${userId}_${workspaceId}_${documentId}`;

  indexingProgress[progressKey] = { progress: 5, status: `Parsing "${title}"...` };

  try {
    // 1. Check for deduplication / embedding caching first!
    const existingChunks = await getExistingDocumentChunks(userId, workspaceId, title);
    if (existingChunks) {
      indexingProgress[progressKey] = { progress: 50, status: `Reusing cached embeddings for "${title}"...` };
      
      // Try to find summary from existing completed documents
      const docs = await getDocuments(userId, workspaceId);
      const existingDoc = docs.find(d => d.title.trim().toLowerCase() === title.trim().toLowerCase() && d.status === 'completed');
      const existingSummary = existingDoc ? (existingDoc as any).summary : undefined;

      // Save duplicate document reference under new documentId
      const clonedDoc: IndexedDocument = {
        documentId,
        userId,
        workspaceId,
        title,
        sourceType,
        sourceUrl,
        indexedAt: new Date().toISOString(),
        status: 'completed',
        progress: 100,
        suggestions: [
          `Summarize "${title}"`,
          `List action items from "${title}"`,
          `Create study flashcards from "${title}"`,
          `Ask key formulas or definitions in "${title}"`,
        ],
        summary: existingSummary,
      };
      await saveDocument(clonedDoc);

      // Save chunk replicas
      for (const chunk of existingChunks) {
        const replica: DocumentChunk = {
          ...chunk,
          chunkId: `${documentId}_${chunk.chunkId.split('_').slice(1).join('_')}`,
          documentId,
        };
        await saveDocumentChunk(replica);
      }

      indexingProgress[progressKey] = { progress: 100, status: `Indexing complete! Reused ${existingChunks.length} chunks.` };
      return;
    }

    // 2. Extract sections mapping back to sources
    const parsedSections: { text: string; pageNumber?: number; heading?: string; slideNumber?: number; timestamp?: string }[] = [];

    if (sourceType === 'pdf' && buffer) {
      let pdfPages: { pageNumber: number; text: string }[] = [];
      let pdfError: Error | null = null;
      try {
        pdfPages = await extractPdfText(buffer);
      } catch (err: any) {
        pdfError = err;
        console.warn('PDF text extraction failed, will attempt multimodal fallback:', err);
      }

      const totalExtractedLength = pdfPages.reduce((sum, p) => sum + p.text.length, 0);

      if (pdfPages.length === 0 || totalExtractedLength < 150) {
        // Fallback to Gemini Multimodal PDF OCR / Extraction
        indexingProgress[progressKey] = { progress: 10, status: `OCR/Multimodal analysis on "${title}"...` };
        console.log(`[Indexer] Scanned or low-text PDF detected (len: ${totalExtractedLength}). Using Gemini multimodal OCR fallback.`);
        
        try {
          const response = await ai.models.generateContent({
            model: 'gemini-3.5-flash',
            contents: [
              {
                inlineData: {
                  data: buffer.toString('base64'),
                  mimeType: 'application/pdf',
                }
              },
              'Please extract all text and content from this PDF page-by-page. For each page, output the text clearly. It is extremely important that you format your response in a way that we can split it by page. Please use the exact delimiter "=== PAGE [Number] ===" at the start of each page, followed by the page text. Example structure:\n=== PAGE 1 ===\n[extracted text from page 1]\n=== PAGE 2 ===\n[extracted text from page 2]\n\nDo not output any introductory or concluding text outside the PAGE delimiters.'
            ]
          });

          const extractedText = response.text || '';
          const pageMatches = [...extractedText.matchAll(/=== PAGE (\d+) ===\s*([\s\S]*?)(?==== PAGE \d+ ===|$)/gi)];
          
          if (pageMatches.length > 0) {
            for (const match of pageMatches) {
              const pageNumber = parseInt(match[1], 10);
              const pageText = match[2].trim();
              if (pageText) {
                parsedSections.push({ text: cleanText(pageText), pageNumber });
              }
            }
          } else {
            // Split by anything or fallback
            const cleanedResponseText = extractedText.replace(/=== PAGE \d+ ===/gi, '').trim();
            if (cleanedResponseText) {
              parsedSections.push({ text: cleanText(cleanedResponseText), pageNumber: 1 });
            } else if (pdfPages.length > 0) {
              for (const p of pdfPages) {
                parsedSections.push({ text: p.text, pageNumber: p.pageNumber });
              }
            } else {
              throw new Error('Could not extract any content from the scanned PDF using AI OCR.');
            }
          }
        } catch (geminiErr: any) {
          console.error('[Indexer] Multimodal OCR fallback failed:', geminiErr);
          if (pdfPages.length > 0) {
            for (const p of pdfPages) {
              parsedSections.push({ text: p.text, pageNumber: p.pageNumber });
            }
          } else {
            throw new Error(`Failed to parse PDF and multimodal fallback failed: ${pdfError?.message || geminiErr.message}`);
          }
        }
      } else {
        for (const p of pdfPages) {
          parsedSections.push({ text: p.text, pageNumber: p.pageNumber });
        }
      }
    } else if (sourceType === 'image' && buffer) {
      indexingProgress[progressKey] = { progress: 10, status: `Extracting text from image "${title}"...` };
      const mimeType = title.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: [
            {
              inlineData: {
                data: buffer.toString('base64'),
                mimeType: mimeType,
              }
            },
            'Extract all text and content from this image. Output the extracted text clearly and format nicely in Markdown. Do not include any other conversational filler.'
          ]
        });
        const text = response.text || '';
        if (!text.trim()) {
          throw new Error('Could not extract any text from the uploaded image.');
        }
        parsedSections.push({ text: cleanText(text) });
      } catch (imgErr: any) {
        console.error('[Indexer] Image text extraction failed:', imgErr);
        throw new Error(`Failed to extract text from image: ${imgErr.message}`);
      }
    } else if (sourceType === 'docx' && buffer) {
      const docxSections = await extractDocxText(buffer);
      for (const s of docxSections) {
        parsedSections.push({ text: s.text, heading: s.heading });
      }
    } else if (sourceType === 'pptx' && buffer) {
      const pptxSlides = await extractPptxText(buffer);
      for (const s of pptxSlides) {
        parsedSections.push({ text: s.text, slideNumber: s.slideNumber });
      }
    } else if (sourceType === 'url' && sourceUrl) {
      const urlSections = await extractUrlText(sourceUrl);
      for (const s of urlSections) {
        parsedSections.push({ text: s.text, heading: s.heading });
      }
    } else if (sourceType === 'youtube' && rawTextContent) {
      const transcriptLines = rawTextContent.split('\n');
      let currentChunkText = '';
      let chunkTimestamp = '00:00';
      
      for (let idx = 0; idx < transcriptLines.length; idx++) {
        const line = transcriptLines[idx];
        const match = line.match(/^\[(\d{2}):(\d{2})\]\s*(.*)$/);
        
        if (match) {
          if (currentChunkText.length === 0) {
            chunkTimestamp = `[${match[1]}:${match[2]}]`;
          }
          currentChunkText += ' ' + match[3];
        } else {
          currentChunkText += ' ' + line;
        }

        if (currentChunkText.length >= 800 || idx === transcriptLines.length - 1) {
          parsedSections.push({ text: currentChunkText.trim(), timestamp: chunkTimestamp });
          currentChunkText = '';
        }
      }
    } else if ((sourceType === 'txt' || sourceType === 'markdown') && rawTextContent) {
      parsedSections.push({ text: cleanText(rawTextContent) });
    } else if (buffer) {
      parsedSections.push({ text: cleanText(buffer.toString('utf8')) });
    }

    if (parsedSections.length === 0) {
      throw new Error('No content could be extracted from this document.');
    }

    // 3. Generate a beautiful executive summary of the document content first
    indexingProgress[progressKey] = { progress: 15, status: `Generating summary for "${title}"...` };
    const fullTextForSummary = parsedSections.map(s => s.text).join('\n\n');
    let documentSummaryText = '';
    try {
      const summaryResponse = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: `You are an elite research assistant. Provide an exceptionally clear, comprehensive, and elegant executive summary of the following document titled "${title}".
Format the summary in beautifully styled Markdown with the following sections:
- **Executive Summary**: A concise 2-sentence overview of the document's purpose.
- **Key Takeaways**: A structured bulleted list of the most important insights, data points, or decisions.
- **Detailed Content Outline**: A clean breakdown of the document's main parts or sections.

Document Content:
"""
${fullTextForSummary.slice(0, 40000)}
"""`
      });
      documentSummaryText = summaryResponse.text || '';
    } catch (sumErr) {
      console.warn('[Indexer] Failed to generate document summary:', sumErr);
      documentSummaryText = 'No automated summary available. Ask specific questions about this document in the chat below.';
    }

    indexingProgress[progressKey] = { progress: 20, status: 'Chunking extracted document texts...' };

    // 4. Perform chunking & link metadata
    const finalChunksToEmbed: {
      text: string;
      pageNumber?: number;
      heading?: string;
      slideNumber?: number;
      timestamp?: string;
    }[] = [];

    for (const section of parsedSections) {
      const textChunks = chunkTextContent(section.text, 1000, 200);
      for (const textChunk of textChunks) {
        finalChunksToEmbed.push({
          text: textChunk,
          pageNumber: section.pageNumber,
          heading: section.heading,
          slideNumber: section.slideNumber,
          timestamp: section.timestamp,
        });
      }
    }

    const totalChunks = finalChunksToEmbed.length;
    console.log(`[Indexer] Prepared ${totalChunks} chunks to embed for "${title}".`);

    indexingProgress[progressKey] = { progress: 30, status: `Generating embeddings (0/${totalChunks})...` };

    // 5. Generate embeddings and save chunks asynchronously
    let sampleChunkText = '';
    
    for (let i = 0; i < totalChunks; i++) {
      const rawChunk = finalChunksToEmbed[i];
      if (i === 0) sampleChunkText = rawChunk.text;

      if (i > 0 && i % 8 === 0) {
        await new Promise(resolve => setTimeout(resolve, 250));
      }

      const embedding = await getEmbeddingWithRetry(ai, rawChunk.text);

      const chunkId = `${documentId}_chunk_${i}`;
      const chunk: DocumentChunk = {
        chunkId,
        documentId,
        userId,
        workspaceId,
        text: rawChunk.text,
        embedding,
        pageNumber: rawChunk.pageNumber,
        heading: rawChunk.heading,
        slideNumber: rawChunk.slideNumber,
        timestamp: rawChunk.timestamp,
        metadata: {
          title,
          sourceType,
          sourceUrl,
        }
      };

      await saveDocumentChunk(chunk);

      const chunkProgress = 30 + Math.floor((i / totalChunks) * 55);
      indexingProgress[progressKey] = { 
        progress: chunkProgress, 
        status: `Generating embeddings (${i + 1}/${totalChunks})...` 
      };
    }

    indexingProgress[progressKey] = { progress: 90, status: 'Generating suggested study questions...' };

    // 6. Generate AI questions/suggestions from the content
    const suggestions = await generateSuggestedQuestions(ai, title, sampleChunkText || fullTextForSummary);

    // 7. Complete and save the document descriptor
    const doc: IndexedDocument = {
      documentId,
      userId,
      workspaceId,
      title,
      sourceType,
      sourceUrl,
      indexedAt: new Date().toISOString(),
      status: 'completed',
      progress: 100,
      suggestions,
      summary: documentSummaryText,
    };
    await saveDocument(doc);

    indexingProgress[progressKey] = { progress: 100, status: 'Indexing completed successfully!' };
    console.log(`[Indexer] Successfully indexed "${title}" with ${totalChunks} chunks.`);
  } catch (err: any) {
    console.error(`[Indexer] Failed to index "${title}":`, err);
    indexingProgress[progressKey] = { 
      progress: 100, 
      status: 'failed', 
      error: err.message || 'Unknown processing error' 
    };

    // Save failed document state
    const failedDoc: IndexedDocument = {
      documentId,
      userId,
      workspaceId,
      title,
      sourceType,
      sourceUrl,
      indexedAt: new Date().toISOString(),
      status: 'failed',
      progress: 100,
    };
    await saveDocument(failedDoc).catch(() => {});
  }
}
