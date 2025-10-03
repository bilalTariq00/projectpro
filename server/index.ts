import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import MemoryStore from "memorystore";
import cors from "cors";
import multer from "multer";
import { registerRoutes } from "./routes.js";
import { registerMobileSpotEndpoints } from "./api-spots.js";
import { initDB } from "./db.js";
import { sendUpcomingJobReminders, processPlanRenewalReminders } from "./services/notifications.js";
import { serveStatic, setupVite } from "./vite.js";

const app = express();

// Simple logging function
function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

// Enable CORS for mobile app and frontend
app.use(cors({
  origin: [
    'http://localhost', 
    'http://localhost:3000', 
    'http://192.168.100.183:3000',
    'http://10.103.181.15:3000',
    'http://10.66.174.113:3000',
    'capacitor://localhost', 
    'ionic://localhost',
    'http://localhost:8100',
    'http://localhost:4200',
    'http://localhost:8080',
    'http://localhost:5173',
    'http://localhost:4173',
    'https://projectpro-production.up.railway.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-mobile-session-id'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, x-mobile-session-id');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.status(204).end();
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
  },
});

app.use(upload.any());

// Setup session
const SessionStore = MemoryStore(session);
app.use(session({
  secret: process.env.SESSION_SECRET || "artisan-project-manager-secret-key",
  resave: false,
  saveUninitialized: false,
  store: new SessionStore({
    checkPeriod: 86400000
  }),
  cookie: { 
    secure: false,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 86400000
  }
}));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    // Initialize database
    await initDB();
    log('Database initialized successfully');
    
    // Register mobile spot endpoints
    registerMobileSpotEndpoints(app);
    
    // Register all other routes
    const server = await registerRoutes(app);

    // Health check endpoint for platform readiness probes
    app.get('/api/health', (_req, res) => {
      res.json({ status: 'ok' });
    });

    // Setup static file serving
    if (process.env.NODE_ENV === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Error handler
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      res.status(status).json({ message });
      console.error(err);
    });

    // Start server
    const port = process.env.PORT || 3000;
    server.listen({
      port: Number(port),
      host: process.env.HOST || "0.0.0.0",
    }, () => {
      log(`Server running on port ${port} on all network interfaces`);
    });

    // Job reminders every 15 minutes
    setInterval(() => {
      sendUpcomingJobReminders().catch((e) => log(`Reminder job failed: ${String(e)}`));
    }, 15 * 60 * 1000);

    // Plan renewal reminders once per day
    setInterval(() => {
      processPlanRenewalReminders(7).catch((e) => log(`Renewal reminders failed: ${String(e)}`));
    }, 24 * 60 * 60 * 1000);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
})();
