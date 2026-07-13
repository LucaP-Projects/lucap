import json
from psycopg import Connection


def insert_document(
    conn: Connection,
    country_code: str,
    content: str,
    filename: str,
    source: str,
    source_url: str | None = None,
) -> str:
    row = conn.execute(
        """INSERT INTO source_document (country_code, content, filename, source, source_url)
           VALUES (%s, %s, %s, %s, %s)
           ON CONFLICT (content) DO UPDATE SET filename = EXCLUDED.filename
           RETURNING id""",
        (country_code, content, filename, source, source_url),
    ).fetchone()
    conn.commit()
    return row["id"]


def insert_segment(
    conn: Connection,
    country_code: str,
    content: str,
    source_document_id: str,
    vector: list[float],
    chunk_index: int = 0,
    page_number: int | None = None,
    tags: list[str] | None = None,
    article_number: int | None = None,
    law_id: str | None = None,
    refs: dict | None = None,
):
    vector_str = "[" + ",".join(str(v) for v in vector) + "]"
    conn.execute(
        """INSERT INTO source_document_segment
           (country_code, content, source_document_id, vector, chunk_index,
            page_number, tags, article_number, law_id, refs)
           VALUES (%s, %s, %s, %s::vector, %s, %s, %s::jsonb, %s, %s, %s::jsonb)
           ON CONFLICT DO NOTHING""",
        (country_code, content, source_document_id, vector_str, chunk_index,
         page_number, json.dumps(tags) if tags else None, article_number,
         law_id, json.dumps(refs) if refs else None),
    )
    conn.commit()


def search_segments(
    conn: Connection,
    country_code: str,
    query_vector: list[float],
    limit: int = 10,
) -> list[dict]:
    vector_str = "[" + ",".join(str(v) for v in query_vector) + "]"
    rows = conn.execute(
        """SELECT s.id, s.content, s.chunk_index, s.page_number, s.tags, s.article_number,
                  d.filename, d.source, d.source_url,
                  1 - (s.vector <=> %s::vector) AS similarity
           FROM source_document_segment s
           JOIN source_document d ON d.id = s.source_document_id
           WHERE s.country_code = %s
           ORDER BY s.vector <=> %s::vector
           LIMIT %s""",
        (vector_str, country_code, vector_str, limit),
    ).fetchall()
    return [dict(r) for r in rows]
