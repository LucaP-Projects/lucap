import { google } from "@ai-sdk/google";
import { embed } from "ai";
import { prisma } from "@/lib/prisma";

const embeddingModel = google.textEmbeddingModel("text-embedding-004", {
  outputDimensionality: 384,
});

interface RagSegment {
  id: string;
  content: string;
  chunkIndex: number;
  pageNumber: number | null;
  tags: any;
  articleNumber: number | null;
  filename: string;
  source: string;
  sourceUrl: string | null;
  similarity: number;
}

async function embedQuery(text: string): Promise<number[]> {
  const result = await embed({ model: embeddingModel, value: text });
  return result.embedding;
}

export async function retrieveRagContext(
  query: string,
  countryCode: string,
  limit = 5,
): Promise<{ segments: RagSegment[]; contextText: string }> {
  const queryVector = await embedQuery(query);
  const vectorStr = `[${queryVector.join(",")}]`;

  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT s.id, s.content, s.chunk_index, s.page_number, s.tags, s.article_number,
            d.filename, d.source, d.source_url,
            1 - (s.vector <=> $1::vector) AS similarity
     FROM source_document_segment s
     JOIN source_document d ON d.id = s.source_document_id
     WHERE s.country_code = $2
     ORDER BY s.vector <=> $1::vector
     LIMIT $3`,
    vectorStr,
    countryCode,
    limit,
  );

  const segments: RagSegment[] = rows.map((r: any) => ({
    id: r.id,
    content: r.content,
    chunkIndex: r.chunk_index,
    pageNumber: r.page_number,
    tags: r.tags,
    articleNumber: r.article_number,
    filename: r.filename,
    source: r.source,
    sourceUrl: r.source_url,
    similarity: Number(r.similarity),
  }));

  const contextText = segments
    .map((s) => `[${s.source}/${s.filename}] (${(s.similarity * 100).toFixed(0)}% match)\n${s.content}`)
    .join("\n\n---\n\n");

  return { segments, contextText };
}
