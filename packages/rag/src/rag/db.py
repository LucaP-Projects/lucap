import os
import psycopg
from psycopg import Connection
from psycopg.rows import dict_row

DB_URL = os.environ.get(
    "RAG_DATABASE_URL",
    os.environ.get("DATABASE_URL", "postgresql://postgres:secret123@localhost:5432/monapp"),
)


def get_conn() -> Connection:
    return psycopg.connect(DB_URL, row_factory=dict_row)


SCHEMA_SQL = """
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS source_document (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code TEXT NOT NULL,
    content TEXT NOT NULL UNIQUE,
    filename TEXT NOT NULL,
    source TEXT NOT NULL,
    source_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS source_document_segment (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country_code TEXT NOT NULL,
    content TEXT NOT NULL,
    source_document_id UUID NOT NULL REFERENCES source_document(id) ON DELETE CASCADE,
    vector vector(384),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    chunk_index INT NOT NULL DEFAULT 0,
    page_number INT,
    tags JSONB,
    article_number INT
);

CREATE INDEX IF NOT EXISTS idx_segment_country ON source_document_segment (country_code);
CREATE INDEX IF NOT EXISTS idx_segment_doc_id ON source_document_segment (source_document_id);
CREATE INDEX IF NOT EXISTS idx_segment_vector ON source_document_segment USING hnsw (vector vector_cosine_ops) WITH (m = 16, ef_construction = 200);
CREATE INDEX IF NOT EXISTS idx_doc_country ON source_document (country_code);
"""


def ensure_schema(conn: Connection):
    conn.execute(SCHEMA_SQL)
    conn.commit()


def count_documents(conn: Connection, country_code: str | None = None) -> int:
    if country_code:
        row = conn.execute(
            "SELECT COUNT(*) as cnt FROM source_document WHERE country_code = %s", (country_code,)
        ).fetchone()
    else:
        row = conn.execute("SELECT COUNT(*) as cnt FROM source_document").fetchone()
    return row["cnt"] if row else 0


def count_segments(conn: Connection, country_code: str | None = None) -> int:
    if country_code:
        row = conn.execute(
            "SELECT COUNT(*) as cnt FROM source_document_segment WHERE country_code = %s", (country_code,)
        ).fetchone()
    else:
        row = conn.execute("SELECT COUNT(*) as cnt FROM source_document_segment").fetchone()
    return row["cnt"] if row else 0
