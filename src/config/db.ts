import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';
import dotenv from 'dotenv';

dotenv.config();

// Validar variables de entorno requeridas
if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL no está definida en las variables de entorno');
}

if (!process.env.TURSO_AUTH_TOKEN) {
  throw new Error('TURSO_AUTH_TOKEN no está definida en las variables de entorno');
}

/**
 * Cliente de conexión a Turso (LibSQL)
 */
export const tursoClient = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

/**
 * Instancia de Drizzle ORM configurada con el schema
 */
export const db = drizzle(tursoClient, { schema });

/**
 * Función para verificar la conexión a la base de datos
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await tursoClient.execute('SELECT 1');
    console.log('✅ Conexión a Turso establecida correctamente');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar con Turso:', error);
    return false;
  }
}

/**
 * Cierra la conexión a la base de datos
 */
export async function closeDatabaseConnection(): Promise<void> {
  try {
    tursoClient.close();
    console.log('🔌 Conexión a Turso cerrada');
  } catch (error) {
    console.error('Error al cerrar la conexión:', error);
  }
}

export { schema };
