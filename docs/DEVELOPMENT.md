# Development Guide

## Local Setup

### Prerequisites
- Node.js 16+ 
- PostgreSQL 12+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/refatwashere/EZTutor.git
   cd EZTutor
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```
   
   This runs:
   - Root package installation
   - Server package installation (`server/npm install`)
   - Client package installation (`client/npm install`)

#### Install Policy
- Root is dependency‑free and only contains orchestration scripts.
- Install dependencies in `server/` and `client/` (or use `npm run install-all` from root).
- Avoid keeping a root `node_modules/` to prevent confusion and bloat.

3. **Environment Setup**

   **Server (.env):**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your values
   ```

   **Client (.env):**
   ```bash
   cp client/.env.example client/.env
   # Edit client/.env with your API base URL
   ```

### Required Environment Variables

**Server:**
```
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/eztutor
JWT_SECRET=your-secret-key-here
GROQ_API_KEY=your-groq-api-key
ENCRYPTION_KEY=your-32-char-encryption-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
```

**Client:**
```
REACT_APP_API_BASE=http://localhost:5000
```

### Running the Application

**Development Mode:**
```bash
# Both server and client (from root)
npm start

# Server only
npm run start-server

# Client only
npm run start-client
```

**Production Build:**
```bash
cd client
npm run build
```

### Database Setup

1. **Create database:**
   ```sql
   CREATE DATABASE eztutor;
   ```

2. **Run migrations:**
   Server automatically creates tables on startup via `db.js`

3. **Verify connection:**
   ```bash
   npm run test --workspace=server
   ```

---

## Project Structure

```
EZTutor/
├── client/                     # React frontend
│   └── src/
│       ├── components/         # Reusable UI components
│       ├── pages/              # Page components
│       ├── hooks/              # Custom React hooks
│       ├── services/           # API client
│       ├── utils/              # Utility functions
│       ├── constants.js        # Frontend constants
│       └── App.js              # Main App component
│
├── server/                     # Node.js backend
│   ├── controllers/            # Route controllers
│   ├── middleware/             # Express middleware
│   ├── routes/                 # API routes
│   ├── services/               # Business logic services
│   ├── utils/                  # Utility functions
│   ├── constants.js            # Server constants
│   ├── db.js                   # Database initialization
│   └── index.js                # Server entry point
│
├── docs/                       # Documentation
│   ├── DEVELOPMENT.md          # This file
│   ├── GOOGLE_CLOUD_SETUP.md   # Google Cloud setup guide
│   ├── OAUTH_FLOW_DETAILED.md  # OAuth flow documentation
│   └── [other guides]
│
└── README.md                   # Project overview
```

---

## Development Workflow

### Code Style & Conventions

**JavaScript:**
- Use ES6+ features
- Use arrow functions for callbacks
- Use `const` by default, `let` when needed, avoid `var`
- Use async/await instead of .then() chains

**React:**
- Use functional components with hooks
- Use custom hooks for shared logic
- One component per file
- Use descriptive prop names

**File Naming:**
- Components: `PascalCase.js` (e.g., `LessonPlan.js`)
- Utilities: `camelCase.js` (e.g., `validators.js`)
- Constants: `UPPER_SNAKE_CASE` for constant names

### Creating New Features

1. **Create a new page:**
   ```bash
   # Create file in client/src/pages/MyFeature.js
   # Follow the pattern from existing pages
   ```

2. **Add API route (server):**
   ```bash
   # Update server/routes/api.js
   # Create controller in server/controllers/
   # Export function from controller
   ```

3. **Create API client method (client):**
   ```javascript
   // In client/src/services/api.js
   export const createMyFeature = (data) => api.post('/my-feature', data);
   ```

4. **Write tests:**
   ```bash
   # Create test file: server/tests/myFeature.test.js
   # Run: npm test --workspace=server
   ```

---

## Testing

### Server Tests

```bash
cd server
npm test
```

Test files are in `server/tests/` and use Node.js built-in test runner.

**Example test structure:**
```javascript
import test from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import app from '../routes/api.js';

test('GET /api/health returns 200', async () => {
  const res = await request(app).get('/api/health');
  assert.strictEqual(res.status, 200);
});
```

### Client Tests

```bash
cd client
npm test
```

Tests use Jest and React Testing Library.

---

## Debugging

### Server Debugging

```bash
# Run with verbose logging
NODE_DEBUG=http npm run dev:server

# Inspect with Node debugger
node --inspect index.js
```

### Client Debugging

- Use Chrome DevTools for React component inspection
- Use React DevTools extension for component debugging
- Check browser console for errors

### Database Debugging

```bash
psql -U postgres -d eztutor
# View tables
\dt
# View table schema
\d table_name
```

---

## Common Tasks

### Add a New NPM Package

**Server:**
```bash
cd server
npm install package-name
```

**Client:**
```bash
cd client
npm install package-name
```

### Reset Database

```bash
# Delete all data (keeps schema)
psql -U postgres -d eztutor -c "TRUNCATE TABLE users CASCADE;"

# Drop and recreate database (full reset)
dropdb -U postgres eztutor
createdb -U postgres eztutor
npm run start-server  # Recreates tables
```

### View API Logs

```bash
# Server logs to stdout by default
npm run dev:server

# Pipe to file for analysis
npm run start-server > server.log 2>&1
```

---

## Performance Tips

- Use database indexes on frequently queried fields
- Implement pagination for large collections
- Cache API responses when appropriate
- Use code splitting in React for large applications
- Profile with Chrome DevTools Performance tab

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 5000
lsof -i :5000

# Kill process
kill -9 <PID>
```

### Database Connection Errors

1. Verify PostgreSQL is running: `psql -U postgres`
2. Check DATABASE_URL is correct
3. Ensure database exists: `createdb eztutor`
4. Check postgres user permissions

### Module Not Found

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Build Errors

```bash
cd client
npm run build -- --analyze
# Check bundle size and dependencies
```

---

## Resources

- [React Documentation](https://react.dev)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Groq API Documentation](https://console.groq.com/docs)

---

**Last Updated:** February 6, 2026
