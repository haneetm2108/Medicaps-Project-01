import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './server/db';
import { seedDatabase } from './server/seed';
import apiRouter from './server/routes';
import { errorHandler } from './server/middleware/errorHandler';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'StaffSync Enterprise API',
    timestamp: new Date().toISOString(),
  });
});

// Central Error Handler for API
app.use(errorHandler);

async function startServer() {
  try {
    // 1. Initialize MongoDB (External or Embedded)
    await connectDB();

    // 2. Seed initial demo dataset if database is empty
    await seedDatabase(false);

    // 3. Mount Vite middlewares in development or static files in production
    if (!isProduction) {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: {
          middlewareMode: true,
          hmr: process.env.DISABLE_HMR !== 'true',
        },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      const distPath = path.resolve(__dirname, 'dist');
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }

    // 4. Start listening on PORT (3000)
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[StaffSync] Full-stack application running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    console.error('[StaffSync] Fatal server startup error:', error);
    process.exit(1);
  }
}

startServer();
