# Deployment Guide

## Environments
Use a `.env` file on the server and ensure the following are set:

```
OPENAI_API_KEY=...
OPENAI_MODEL=gpt-4o
OPENAI_TIMEOUT_MS=20000
OPENAI_MAX_RETRIES=2
EZTUTOR_API_KEY=optional_api_key_for_clients
PORT=5000
```

## Server Deployment
1. Install dependencies in `server/`.
2. Start the API using `npm start`.
3. Confirm health check is responding at `/api`.

## Client Deployment
1. Install dependencies in `client/`.
2. Build with `npm run build`.
3. Serve `client/build` with your static host.

## Post-Deploy Verification
1. Generate a lesson plan.
2. Generate a quiz.
3. Verify Resource Hub works (upload + search).
4. Check logs for latency/size buckets and any 4xx/5xx errors.
