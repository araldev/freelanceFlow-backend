import { Request, Response, NextFunction } from 'express';

/**
 * Clase personalizada para errores de la aplicación
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Middleware para manejo global de errores
 */
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Error operacional (controlado)
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
    });
  }

  // Error de validación de Zod
  if (err.name === 'ZodError') {
    return res.status(400).json({
      status: 'error',
      message: 'Datos de entrada inválidos',
      errors: err,
    });
  }

  // Error no controlado (bug)
  console.error('💥 ERROR NO CONTROLADO:', err);
  
  return res.status(500).json({
    status: 'error',
    message: process.env.NODE_ENV === 'production' 
      ? 'Algo salió mal' 
      : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Wrapper para funciones async en Express
 * Evita tener que usar try-catch en cada controlador
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};
