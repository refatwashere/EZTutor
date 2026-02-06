# Credentials Folder

This folder should contain your Google OAuth client credentials JSON.

## Required File
- `client_secret.json` (or the downloaded `client_secret_*.json` renamed to `client_secret.json`)

## How to Get It
1. Follow `docs/GOOGLE_CLOUD_SETUP.md` to create OAuth credentials.
2. Download the JSON credentials file from Google Cloud Console.
3. Place it in this folder and name it `client_secret.json`.

## Important
- **Never commit real credentials**.
- This folder is ignored by git except for the template and README.
- Use `client_secret.example.json` as a template only.
