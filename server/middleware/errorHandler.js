function errorHandler(err, req, res, next) {
  // Always log the full error server-side for diagnostics
  console.error(err && err.stack ? err.stack : err);

  const status = err.status || 500;

  // In production, avoid sending internal error messages to clients
  const isProd = process.env.NODE_ENV === 'production';
  const clientMessage = isProd ? 'Internal Server Error' : err.message || 'Internal Server Error';

  res.status(status).json({ error: clientMessage });
}

module.exports = errorHandler;
