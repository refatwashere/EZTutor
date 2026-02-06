# Deployment Guide

## Environments
Use a `.env` file on the server and ensure the following are set:

```
GROQ_API_KEY=...
GROQ_MODEL=llama-3.1-8b-instant
GROQ_TIMEOUT_MS=20000
GROQ_MAX_RETRIES=2
EZTUTOR_API_KEY=optional_api_key_for_clients
JWT_SECRET=change_me
DATABASE_URL=
DB_SSL=true
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=
DB_PORT=5432
PORT=5000
EZTUTOR_MODE=
```

## Server Deployment
1. Install dependencies in `server/`.
2. Start the API using `npm start`.
3. Confirm health check is responding at `/health` and `/health/groq`.
4. Verify auth and recents endpoints respond with valid tokens and data.

## Client Deployment
1. Install dependencies in `client/`.
2. Build with `npm run build`.
3. Serve `client/build` with your static host.
4. Set `REACT_APP_API_BASE` to your API URL (for example, Render).
5. If using Render Postgres, set `DATABASE_URL` and keep `DB_SSL=true`.
6. (Optional) Wire `/api/support` to an email provider if you want real inbox delivery.

## Post-Deploy Verification
1. Generate a lesson plan.
2. Generate a quiz.
3. Verify Resource Hub works (upload + search).
4. Sign up and log in, then confirm recents populate and clear correctly.
5. Check logs for latency/size buckets and any 4xx/5xx errors.
