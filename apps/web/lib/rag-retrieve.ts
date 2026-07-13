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
  tags: string[];
  lawId: string | null;
  filename: string;
  source: string;
  similarity: number;
  keywordScore: number;
  rerankScore: number;
}

async function embedQuery(text: string): Promise<number[]> {
  const result = await embed({ model: embeddingModel, value: text });
  return result.embedding;
}

function queryExpansion(query: string): string {
  const expansions: Record<string, string> = {
    "is ": "impôt sur les sociétés corporate tax ",
    "tva": "taxe sur la valeur ajoutée vat ",
    "irpp": "impôt sur le revenu des personnes physiques income tax ",
    "taux": "taux pourcentage rate percent ",
    "déclaration": "déclaration déclarer filing submit ",
    "sarl": "société à responsabilité limitée company ",
  };
  let expanded = query;
  for (const [key, val] of Object.entries(expansions)) {
    if (query.toLowerCase().includes(key)) expanded += val;
  }
  return expanded;
}

function keywordSimilarity(query: string, content: string): number {
  const qWords = new Set(query.toLowerCase().split(/\s+/));
  const cWords = content.toLowerCase().split(/\s+/);
  const matches = cWords.filter((w) => qWords.has(w)).length;
  return matches / Math.max(qWords.size, 1);
}

function sectorBoost(query: string, tags: string[]): number {
  if (!tags?.length) return 1;
  const q = query.toLowerCase();
  for (const tag of tags) {
    if (q.includes(tag)) return 1.15;
    if (tag.includes("tax") && (q.includes("impôt") || q.includes("taxe") || q.includes("tva"))) return 1.15;
    if (tag.includes("labor") && (q.includes("travail") || q.includes("salaire") || q.includes("employee"))) return 1.15;
    if (tag.includes("corporate") && (q.includes("société") || q.includes("sarl") || q.includes("company"))) return 1.15;
  }
  return 1;
}

function deduplicate(segments: RagSegment[], threshold = 0.9): RagSegment[] {
  const result: RagSegment[] = [];
  for (const seg of segments) {
    let dup = false;
    const words = new Set(seg.content.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
    for (const existing of result) {
      const existingWords = new Set(existing.content.toLowerCase().split(/\s+/).filter((w) => w.length > 3));
      const intersection = new Set([...words].filter((w) => existingWords.has(w)));
      const union = new Set([...words, ...existingWords]);
      const jaccard = intersection.size / (union.size || 1);
      if (jaccard > threshold) { dup = true; break; }
    }
    if (!dup) result.push(seg);
  }
  return result;
}

function formatAmendmentChain(segments: RagSegment[]): string {
  const lawIds = segments.filter((s) => s.lawId).map((s) => s.lawId);
  if (!lawIds.length) return "";
  const unique = [...new Set(lawIds)];
  return unique.join(", ");
}

export async function retrieveRagContext(
  query: string,
  countryCode: string,
  limit = 8,
): Promise<{ segments: RagSegment[]; contextText: string }> {
  const expandedQuery = queryExpansion(query);
  const queryVector = await embedQuery(expandedQuery);
  const vectorStr = `[${queryVector.join(",")}]`;

  const initialLimit = Math.min(limit * 4, 40);

  const rows: any[] = await prisma.$queryRawUnsafe(
    `SELECT s.id, s.content, s.chunk_index, s.tags, s.law_id,
            d.filename, d.source, d.source_url,
            1 - (s.vector <=> $1::vector) AS vector_sim
     FROM source_document_segment s
     JOIN source_document d ON d.id = s.source_document_id
     WHERE s.country_code = $2
     ORDER BY s.vector <=> $1::vector
     LIMIT $3`,
    vectorStr,
    countryCode,
    initialLimit,
  );

  if (!rows?.length) {
    return { segments: [], contextText: "" };
  }

  let segments: RagSegment[] = rows.map((r: any) => {
    const vecSim = Number(r.vector_sim);
    const kwSim = keywordSimilarity(expandedQuery, r.content);
    const hybrid = 0.7 * vecSim + 0.3 * kwSim;
    const boost = sectorBoost(expandedQuery, r.tags || []);
    return {
      id: r.id,
      content: r.content,
      chunkIndex: r.chunk_index,
      tags: r.tags || [],
      lawId: r.law_id,
      filename: r.filename,
      source: r.source,
      similarity: vecSim,
      keywordScore: kwSim,
      rerankScore: hybrid * boost,
    };
  });

  segments.sort((a, b) => b.rerankScore - a.rerankScore);
  segments = deduplicate(segments);
  segments = segments.slice(0, limit);

  const lawChain = formatAmendmentChain(segments);
  const contextText = segments
    .map((s) => {
      const law = s.lawId ? ` (${s.lawId})` : "";
      const tags = s.tags?.length ? ` [${s.tags.join(", ")}]` : "";
      return `[${s.source}/${s.filename}]${tags}${law}\n${s.content}`;
    })
    .join("\n\n---\n\n");

  return { segments, contextText };
}
