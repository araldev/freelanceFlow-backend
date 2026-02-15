import { ClientsRepository } from './clients.repository';
import { AppError } from '../../middleware/errorHandler';
import type { Client } from '../../config/schema';
import type { CreateClientInput, UpdateClientInput } from './clients.schema';
import type { PaginationMeta } from '../../shared/types/apiResponse';

/**
 * Servicio de Clientes
 * Capa de lógica de negocio
 */
export class ClientsService {
  private repository: ClientsRepository;

  constructor() {
    this.repository = new ClientsRepository();
  }

  /**
   * Crear un nuevo cliente
   */
  async createClient(userId: string, data: CreateClientInput): Promise<Client> {
    // Validaciones de negocio adicionales si es necesario
    if (!data.email.includes('@')) {
      throw new AppError(400, 'Formato de email inválido');
    }

    return await this.repository.create(userId, data);
  }

  /**
   * Obtener todos los clientes del usuario con paginación
   */
  async getClients(
    userId: string,
    options: {
      page: number;
      pageSize: number;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<{ clients: Client[]; pagination: PaginationMeta }> {
    const { page, pageSize, search, isActive } = options;

    // Validar parámetros de paginación
    if (page < 1) {
      throw new AppError(400, 'El número de página debe ser mayor a 0');
    }
    
    if (pageSize < 1 || pageSize > 100) {
      throw new AppError(400, 'El tamaño de página debe estar entre 1 y 100');
    }

    const { clients: clientsList, total } = await this.repository.findAll(
      userId,
      { page, pageSize, search, isActive }
    );

    const totalPages = Math.ceil(total / pageSize);

    return {
      clients: clientsList,
      pagination: {
        page,
        pageSize,
        totalItems: total,
        totalPages,
      },
    };
  }

  /**
   * Obtener un cliente por ID
   */
  async getClientById(userId: string, clientId: string): Promise<Client> {
    const client = await this.repository.findById(userId, clientId);

    if (!client) {
      throw new AppError(404, 'Cliente no encontrado');
    }

    return client;
  }

  /**
   * Actualizar un cliente
   */
  async updateClient(
    userId: string,
    clientId: string,
    data: UpdateClientInput
  ): Promise<Client> {
    // Verificar que el cliente existe y pertenece al usuario
    const exists = await this.repository.exists(userId, clientId);
    if (!exists) {
      throw new AppError(404, 'Cliente no encontrado');
    }

    const updatedClient = await this.repository.update(userId, clientId, data);

    if (!updatedClient) {
      throw new AppError(500, 'Error al actualizar el cliente');
    }

    return updatedClient;
  }

  /**
   * Eliminar un cliente (soft delete)
   */
  async deleteClient(userId: string, clientId: string): Promise<void> {
    const exists = await this.repository.exists(userId, clientId);
    if (!exists) {
      throw new AppError(404, 'Cliente no encontrado');
    }

    const deleted = await this.repository.softDelete(userId, clientId);

    if (!deleted) {
      throw new AppError(500, 'Error al eliminar el cliente');
    }
  }

  /**
   * Eliminar permanentemente un cliente
   */
  async permanentlyDeleteClient(userId: string, clientId: string): Promise<void> {
    const exists = await this.repository.exists(userId, clientId);
    if (!exists) {
      throw new AppError(404, 'Cliente no encontrado');
    }

    const deleted = await this.repository.hardDelete(userId, clientId);

    if (!deleted) {
      throw new AppError(500, 'Error al eliminar el cliente permanentemente');
    }
  }
}
