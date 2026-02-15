import { Router } from 'express';
import { ClientsController } from './clients.controller';
import { authenticate } from '../../middleware/auth';
import { validateRequest } from '../../middleware/validation';
import {
  createClientSchema,
  updateClientSchema,
  getClientByIdSchema,
  deleteClientSchema,
  listClientsSchema,
} from './clients.schema';

const router = Router();
const controller = new ClientsController();

/**
 * Todas las rutas requieren autenticación
 * El middleware `authenticate` extrae el userId del JWT y lo agrega al request
 */

// GET /api/v1/clients - Listar todos los clientes del usuario
router.get(
  '/',
  authenticate,
  validateRequest(listClientsSchema),
  controller.getClients
);

// POST /api/v1/clients - Crear un nuevo cliente
router.post(
  '/',
  authenticate,
  validateRequest(createClientSchema),
  controller.createClient
);

// GET /api/v1/clients/:id - Obtener un cliente específico
router.get(
  '/:id',
  authenticate,
  validateRequest(getClientByIdSchema),
  controller.getClientById
);

// PUT /api/v1/clients/:id - Actualizar un cliente
router.put(
  '/:id',
  authenticate,
  validateRequest(updateClientSchema),
  controller.updateClient
);

// DELETE /api/v1/clients/:id - Eliminar un cliente (soft delete)
router.delete(
  '/:id',
  authenticate,
  validateRequest(deleteClientSchema),
  controller.deleteClient
);

export default router;
