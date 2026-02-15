/**
 * Script de utilidad para generar JWT tokens para testing
 * Uso: tsx scripts/generate-token.ts [userId] [email]
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

interface TokenPayload {
  userId: string;
  email: string;
}

function generateToken(userId: string, email: string): string {
  const payload: TokenPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

// Obtener argumentos de la línea de comandos
const userId = process.argv[2] || 'test-user-id-123';
const email = process.argv[3] || 'freelancer@example.com';

const token = generateToken(userId, email);

console.log('\n===========================================');
console.log('🔑 JWT Token Generado');
console.log('===========================================\n');
console.log('User ID:', userId);
console.log('Email:', email);
console.log('Expira en:', JWT_EXPIRES_IN);
console.log('\n-------------------------------------------');
console.log('Token:');
console.log('-------------------------------------------\n');
console.log(token);
console.log('\n===========================================\n');
console.log('💡 Usa este token en el header Authorization:');
console.log(`   Authorization: Bearer ${token}`);
console.log('\n===========================================\n');

export { generateToken };
