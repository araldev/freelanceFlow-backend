import { Request, Response } from 'express';
import { ClientsService } from './clients.service';
import { catchAsync } from '../../middleware/errorHandler';
import { successResponse, paginatedResponse } from '../../shared/types/apiResponse';

/**
 * Controlador de Clientes
 * Maneja las peticiones HTTP y delega la lógica al servicio
 */
export class ClientsController {
  private service: ClientsService;

  constructor() {
    this.service = new ClientsService();
  }

  /**
   * GET /api/v1/clients
   * Obtener todos los clientes del usuario autenticado
   */
  getClients = catchAsync(async (req: Request, res: Response) => {
    // El userId viene del middleware de autenticación
    const userId = req.userId!;
    
    // Parámetros de query (ya validados por el schema)
    const { page, pageSize, search, isActive } = req.query;

    const result = await this.service.getClients(userId, {
      page: Number(page) || 1,
      pageSize: Number(pageSize) || 10,
      search: search as string,
      isActive: isActive as boolean | undefined,
    });

    res.status(200).json(
      paginatedResponse(result.clients, result.pagination, 'Clientes obtenidos correctamente')
    );
  });

  /**
   * POST /api/v1/clients
   * Crear un nuevo cliente
   */
  createClient = catchAsync(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const clientData = req.body;

    const newClient = await this.service.createClient(userId, clientData);

    res.status(201).json(
      successResponse(newClient, 'Cliente creado correctamente')
    );
  });

  /**
   * GET /api/v1/clients/:id
   * Obtener un cliente específico
   */
  getClientById = catchAsync(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    if (id) {
      const client = await this.service.getClientById(userId, id);
  
      res.status(200).json(
        successResponse(client, 'Cliente obtenido correctamente')
      )
    } else {
      res.status(400).json(
        successResponse(null, 'ID de cliente es requerido')
      )
    }

  });

  /**
   * PUT /api/v1/clients/:id
   * Actualizar un cliente
   */
  updateClient = catchAsync(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const updates = req.body;

    if (!id) {
      return res.status(400).json(
        successResponse(null, 'ID de cliente es requerido')
      );
    }

    const updatedClient = await this.service.updateClient(userId, id, updates);

    return res.status(200).json(
      successResponse(updatedClient, 'Cliente actualizado correctamente')
    );
  });

  /**
   * DELETE /api/v1/clients/:id
   * Eliminar un cliente (soft delete)
   */
  deleteClient = catchAsync(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json(
        successResponse(null, 'ID de cliente es requerido')
      );
    }

    await this.service.deleteClient(userId, id);

    return res.status(200).json(
      successResponse(null, 'Cliente eliminado correctamente')
    );
  });
}
