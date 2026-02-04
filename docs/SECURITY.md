# Security Notes

## API Key Protection
If `EZTUTOR_API_KEY` is set, all `/api` routes require `x-api-key`.

## Auth Tokens
- Auth uses JWTs signed with `JWT_SECRET`.
- Store tokens in secure client storage and send `Authorization: Bearer <token>`.
- Rotate JWT secrets if a leak is suspected.

## Rate Limiting
API requests are rate-limited (100 requests per 15 minutes per IP).

## Input Validation
Server validates required fields, types, and max lengths for lesson and quiz input.
Auth inputs enforce basic password length and email format checks.

## Password Storage
Passwords are hashed using `bcryptjs` before being stored in MySQL.

## Database Security
- Use a least-privilege MySQL user for the app.
- Keep DB credentials out of source control and rotate regularly.

## Recommended Practices
- Rotate Groq API keys regularly.
- Store secrets in environment variables only.
- Enable HTTPS in production.
