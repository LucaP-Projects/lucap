Phase 1 infrastructure for LucaP (local development)

Services provisioned by docker-compose:

- PostgreSQL (port internal 5432)
- MinIO (S3-compatible object storage) with console on 9001
- MinIO init job to create `lucap-clients` and `lucap-sandbox` buckets
- ClamAV (daemon on port 3310)
- Nginx reverse proxy (ports 80/443) with `client_max_body_size 15M`
- `web` placeholder service expected to run Next.js dev server on port 3000

Notes / next steps:

- Object Lock (WORM) must be enabled for `lucap-clients` in production. Local MinIO may not support object-lock via single-node mode; enable in distributed/production mode or configure policy on your MinIO host.
- TLS certificates are not bundled here. Mount your certs into `nginx` or provide a companion proxy like Traefik for automatic cert provisioning.
- The `minio-init` service relies on `mc` to create buckets and import a lifecycle policy for the sandbox bucket to purge after 30 days.

Usage:

1. Copy `.env.example` to `.env` and adjust secrets.
2. Start services:

```sh
docker compose up -d
```

3. Verify MinIO console: http://localhost:9001
4. Verify ClamAV listening on port 3310 (TCP)
