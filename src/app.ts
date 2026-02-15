import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './middleware/errorHandler';
import clientsRouter from './modules/clients/clients.routes';

/**
 * Configuración principal de la aplicación Express
 */
export const createApp = (): Application => {
  const app = express();

  // ===========================
  // SECURITY MIDDLEWARE
  // ===========================
  
  // Helmet añade headers de seguridad HTTP
  app.use(helmet());

  // CORS - Configuración para permitir peticiones desde el frontend
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      credentials: true,
    })
  );

  // ===========================
  // BODY PARSING MIDDLEWARE
  // ===========================
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // ===========================
  // HEALTH CHECK
  // ===========================
  
  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
    });
  });

  // ===========================
  // API ROUTES
  // ===========================
  
  const API_VERSION = process.env.API_VERSION || 'v1';
  
  // Ruta de bienvenida
  app.get(`/api/${API_VERSION}`, (_req: Request, res: Response) => {
    res.status(200).json({
      message: 'FreelanceFlow API',
      version: API_VERSION,
      documentation: '/api/docs',
    });
  });

  // Módulos de la aplicación
  app.use(`/api/${API_VERSION}/clients`, clientsRouter);
  
  // TODO: Añadir más módulos aquí
  // app.use(`/api/${API_VERSION}/invoices`, invoicesRouter);
  // app.use(`/api/${API_VERSION}/projects`, projectsRouter);
  // app.use(`/api/${API_VERSION}/auth`, authRouter);

  // ===========================
  // 404 HANDLER
  // ===========================
  
  app.use('*', (req: Request, res: Response) => {
    res.status(404).json({
      status: 'error',
      message: `Ruta ${req.originalUrl} no encontrada`,
    });
  });

  // ===========================
  // ERROR HANDLER (DEBE SER EL ÚLTIMO)
  // ===========================
  
  app.use(errorHandler);

  return app;
};
