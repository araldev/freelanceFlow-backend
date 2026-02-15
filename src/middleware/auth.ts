import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler';

/**
 * Interface para el payload del JWT
 */
export interface JwtPayload {
  userId: string;
  email: string;
}

/**
 * Extendemos la interface de Request de Express
 * para incluir el userId autenticado
 */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * Middleware de autenticación JWT
 * Verifica el token y agrega el userId al request
 */
export const authenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  try {
    // Obtener token del header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'No se proporcionó token de autenticación');
    }

    const token = authHeader.substring(7); // Eliminar "Bearer "

    // Verificar token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET no está configurado');
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    // Agregar userId al request para usarlo en los controladores
    req.userId = decoded.userId;

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Token inválido'));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError(401, 'Token expirado'));
    } else {
      next(error);
    }
  }
};

/**
 * Middleware simulado de autenticación para desarrollo
 * SOLO PARA TESTING - NO USAR EN PRODUCCIÓN
 */
export const mockAuthenticate = (
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  // Simula un usuario autenticado
  // En desarrollo, puedes pasar el userId en un header personalizado
  req.userId = req.headers['x-user-id'] as string || 'mock-user-id';
  next();
};
