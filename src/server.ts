import dotenv from 'dotenv';
import { createApp } from './app';
import { testDatabaseConnection, closeDatabaseConnection } from './config/db';

// Cargar variables de entorno
dotenv.config();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Inicia el servidor
 */
async function startServer() {
  try {
    // Verificar conexión a la base de datos
    console.log('🔄 Verificando conexión a la base de datos...');
    const dbConnected = await testDatabaseConnection();
    
    if (!dbConnected) {
      throw new Error('No se pudo conectar a la base de datos');
    }

    // Crear aplicación Express
    const app = createApp();

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log('');
      console.log('╔═══════════════════════════════════════════════╗');
      console.log('║     🚀 FreelanceFlow Backend API             ║');
      console.log('╚═══════════════════════════════════════════════╝');
      console.log('');
      console.log(`📍 Servidor:     http://localhost:${PORT}`);
      console.log(`🌍 Entorno:      ${NODE_ENV}`);
      console.log(`📚 API Docs:     http://localhost:${PORT}/api/v1`);
      console.log(`💚 Health Check: http://localhost:${PORT}/health`);
      console.log('');
      console.log('✅ Servidor listo para recibir peticiones');
      console.log('');
    });

    // Manejo de cierre graceful
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n⚠️  Señal ${signal} recibida. Cerrando servidor...`);
      
      server.close(async () => {
        console.log('🔌 Servidor HTTP cerrado');
        
        // Cerrar conexión a la base de datos
        await closeDatabaseConnection();
        
        console.log('👋 Proceso terminado correctamente');
        process.exit(0);
      });

      // Forzar cierre después de 10 segundos
      setTimeout(() => {
        console.error('⏱️  Timeout: Forzando cierre del proceso');
        process.exit(1);
      }, 10000);
    };

    // Escuchar señales de terminación
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Manejo de errores no capturados
    process.on('unhandledRejection', (reason: any) => {
      console.error('💥 Rechazo de promesa no manejado:', reason);
      gracefulShutdown('unhandledRejection');
    });

    process.on('uncaughtException', (error: Error) => {
      console.error('💥 Excepción no capturada:', error);
      gracefulShutdown('uncaughtException');
    });

  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();
