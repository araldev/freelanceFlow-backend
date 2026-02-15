import { db } from '../../config/db';
import { clients, type Client, type NewClient } from '../../config/schema';
import { eq, and, like, or, sql, desc } from 'drizzle-orm';

/**
 * Repositorio de Clientes
 * Capa de acceso a datos - Todas las queries filtran por userId (Multi-tenancy)
 */
export class ClientsRepository {
  /**
   * Crear un nuevo cliente
   * CRITICAL: Siempre incluye el userId para garantizar aislamiento de datos
   */
  async create(userId: string, clientData: Omit<NewClient, 'userId'>): Promise<Client> {
    const [newClient] = await db
      .insert(clients)
      .values({
        ...clientData,
        userId, // ← Garantiza que el cliente pertenece al usuario
      })
      .returning();

    return newClient!;
  }

  /**
   * Obtener todos los clientes de un usuario con paginación y búsqueda
   */
  async findAll(
    userId: string,
    options: {
      page: number;
      pageSize: number;
      search?: string;
      isActive?: boolean;
    }
  ): Promise<{ clients: Client[]; total: number }> {
    const { page, pageSize, search, isActive } = options;
    const offset = (page - 1) * pageSize;

    // Construir condiciones WHERE
    const conditions = [eq(clients.userId, userId)]; // ← SIEMPRE filtrar por userId

    if (isActive !== undefined) {
      conditions.push(eq(clients.isActive, isActive));
    }

    if (search) {
      conditions.push(
        or(
          like(clients.name, `%${search}%`),
          like(clients.email, `%${search}%`),
          like(clients.company, `%${search}%`)
        )!
      );
    }

    // Obtener clientes paginados
    const clientsList = await db
      .select()
      .from(clients)
      .where(and(...conditions))
      .orderBy(desc(clients.createdAt))
      .limit(pageSize)
      .offset(offset);

    // Contar total de resultados
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(clients)
      .where(and(...conditions));

    return {
      clients: clientsList,
      total: Number(countResult[0]?.count || 0),
    };
  }

  /**
   * Obtener un cliente por ID
   * CRITICAL: Verifica que el cliente pertenece al usuario
   */
  async findById(userId: string, clientId: string): Promise<Client | null> {
    const [client] = await db
      .select()
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.userId, userId) // ← Garantiza aislamiento
        )
      )
      .limit(1);

    return client || null;
  }

  /**
   * Actualizar un cliente
   * CRITICAL: Solo puede actualizar clientes propios
   */
  async update(
    userId: string,
    clientId: string,
    updates: Partial<Omit<Client, 'id' | 'userId' | 'createdAt'>>
  ): Promise<Client | null> {
    const [updatedClient] = await db
      .update(clients)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.userId, userId) // ← Solo actualiza si le pertenece
        )
      )
      .returning();

    return updatedClient || null;
  }

  /**
   * Eliminar un cliente (soft delete - marcar como inactivo)
   * CRITICAL: Solo puede eliminar clientes propios
   */
  async softDelete(userId: string, clientId: string): Promise<boolean> {
    const [deletedClient] = await db
      .update(clients)
      .set({ isActive: false })
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.userId, userId) // ← Solo elimina si le pertenece
        )
      )
      .returning();

    return !!deletedClient;
  }

  /**
   * Eliminar permanentemente un cliente
   * CRITICAL: Solo puede eliminar clientes propios
   */
  async hardDelete(userId: string, clientId: string): Promise<boolean> {
    const result = await db
      .delete(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.userId, userId) // ← Solo elimina si le pertenece
        )
      )
      .returning();

    return result.length > 0;
  }

  /**
   * Verificar si un cliente existe y pertenece al usuario
   */
  async exists(userId: string, clientId: string): Promise<boolean> {
    const [result] = await db
      .select({ id: clients.id })
      .from(clients)
      .where(
        and(
          eq(clients.id, clientId),
          eq(clients.userId, userId)
        )
      )
      .limit(1);

    return !!result;
  }
}
