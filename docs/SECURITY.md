# Security Notes

## API Key Protection
If `EZTUTOR_API_KEY` is set, all `/api` routes require `x-api-key`.

## Rate Limiting
API requests are rate-limited (100 requests per 15 minutes per IP).

## Input Validation
Server validates required fields, types, and max lengths for lesson and quiz input.

## Recommended Practices
- Rotate OpenAI keys regularly.
- Store secrets in environment variables only.
- Enable HTTPS in production.
