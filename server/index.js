const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const compression = require('compression');
const db = require('./db');

dotenv.config();

const apiRouter = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
  const requestId = crypto.randomUUID();
  req.id = requestId;
  res.setHeader('x-request-id', requestId);
  const start = process.hrtime.bigint();
  let bytesWritten = 0;
  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);
  res.write = (chunk, encoding, cb) => {
    if (chunk) {
      bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }
    return originalWrite(chunk, encoding, cb);
  };
  res.end = (chunk, encoding, cb) => {
    if (chunk) {
      bytesWritten += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk, encoding);
    }
    return originalEnd(chunk, encoding, cb);
  };
  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const latencyBucket =
      durationMs < 100 ? '<100ms' : durationMs < 300 ? '100-300ms' : durationMs < 1000 ? '300ms-1s' : '>1s';
    const sizeBytes = Number(res.getHeader('Content-Length')) || bytesWritten;
    const sizeBucket =
      sizeBytes < 5_000 ? '<5KB' : sizeBytes < 20_000 ? '5-20KB' : sizeBytes < 100_000 ? '20-100KB' : '>100KB';
    console.log(
      `[${requestId}] ${req.method} ${req.originalUrl} ${res.statusCode} ${durationMs.toFixed(
        1
      )}ms ${latencyBucket} ${sizeBytes}B ${sizeBucket}`
    );
  });
  next();
});

function apiKeyAuth(req, res, next) {
  const requiredKey = process.env.EZTUTOR_API_KEY;
  if (!requiredKey) return next();
  const providedKey = req.header('x-api-key');
  if (!providedKey || providedKey !== requiredKey) {
    return res.status(401).json({ error: 'invalid or missing API key' });
  }
  return next();
}

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', apiKeyAuth, apiLimiter);
app.use('/api', apiRouter);

app.get('/', (req, res) => res.send('EZTutor API is running'));
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get('/health/groq', async (req, res) => {
  try {
    if (!process.env.GROQ_API_KEY) {
      return res.status(503).json({ status: 'missing_key' });
    }
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error' });
  }
});

// central error handler
app.use(errorHandler);

if (require.main === module) {
  db.init().catch((err) => {
    console.error('Failed to initialize DB', err);
  });
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
