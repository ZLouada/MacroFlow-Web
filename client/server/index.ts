/**
 * MacroFlow Headless API Server
 * 
 * Standalone Express server providing economic simulation endpoints.
 * Can be run alongside or separately from the Vite development server.
 * 
 * Usage:
 *   npm run server        # Development with hot reload
 *   npm run server:prod   # Production mode
 * 
 * Endpoints:
 *   POST /api/simulate/mundell-fleming - Full Mundell-Fleming IS-LM-BOP simulation
 *   POST /api/simulate/is-lm          - Basic IS-LM equilibrium
 *   POST /api/simulate/curves         - Generate curve data for charts
 *   GET  /api/health                  - Health check
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { simulateRouter } from './routes/simulate.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || 3001;

// ============================================================================
// Middleware
// ============================================================================

// CORS configuration - allow frontend dev server
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite dev server
    'http://localhost:3000',  // Alternative dev port
    'http://localhost:4173',  // Vite preview
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse JSON bodies
app.use(express.json({ limit: '1mb' }));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ============================================================================
// Routes
// ============================================================================

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    endpoints: [
      'POST /api/simulate/mundell-fleming',
      'POST /api/simulate/is-lm',
      'POST /api/simulate/curves',
      'GET /api/health',
    ],
  });
});

// Simulation routes
app.use('/api/simulate', simulateRouter);

// 404 handler for API routes
app.use('/api', (_req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: 'The requested API endpoint does not exist',
    availableEndpoints: [
      'POST /api/simulate/mundell-fleming',
      'POST /api/simulate/is-lm',
      'POST /api/simulate/curves',
      'GET /api/health',
    ],
  });
});

// ============================================================================
// Frontend Static Serving (Production SPA Route Fallback)
// ============================================================================
if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'deploy') {
  const distPath = path.join(__dirname, '../dist');
  
  // Serve static files from dist directory
  app.use(express.static(distPath));

  // Catch-all route to serve index.html for React Router
  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  // Catch-all 404 for development
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });
}

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║                                                            ║
║   MacroFlow API Server                                     ║
║                                                            ║
║   Running on: http://localhost:${PORT}                       ║
║   Environment: ${process.env.NODE_ENV || 'development'}                            ║
║                                                            ║
║   Endpoints:                                               ║
║     POST /api/simulate/mundell-fleming                     ║
║     POST /api/simulate/is-lm                               ║
║     POST /api/simulate/curves                              ║
║     GET  /api/health                                       ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `);
});

export default app;
