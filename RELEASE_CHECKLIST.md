# Release Checklist

## Pre-Release
1. Update `CHANGELOG.md` under **[Unreleased]** and add a new version heading.
2. Verify `.env.example` matches required configuration.
3. Confirm `npm test` passes in `server/`.
4. Run `npm run build` in `client/` and verify output builds cleanly.
5. Ensure `README.md` reflects current features and structure.

## Functional Checks
1. Generate a lesson plan end-to-end.
2. Generate a quiz end-to-end.
3. Confirm Resource Hub uploads + search work.
4. Verify copy/download actions on lesson and quiz.

## Security & Performance
1. Verify rate limiting is active.
2. If `EZTUTOR_API_KEY` is set, validate API key enforcement.
3. Confirm response compression is enabled.

## Release
1. Tag release in Git (optional).
2. Deploy server.
3. Deploy client.
