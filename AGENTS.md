
## Repowise (MCP) — codebase intelligence engine
Initialized with `--index-only` at commit `0ac41294d235`.
- get_context: skeleton view (~95% of file) cheaper than Read. Pass `filePath::SymbolName` for callers/callees.
- get_dead_code: high tier = no importers in graph, safe to delete after confirming no runtime loading.
- get_risk: consult before editing 95th+ churn-percentile files (112 hotspots, 522 bus-factor-1 files).
- get_health: 8.19/10 avg. Worst file: components/items/actions.ts at 1.0/10.
- Semantic search (get_answer) requires LLM wiki pages — run `repowise init --resume` with an API key to generate.
