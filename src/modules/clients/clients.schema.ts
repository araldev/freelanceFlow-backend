import { z } from 'zod';

/**
 * Schema de validación para crear un cliente
 */
export const createClientSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'El nombre es requerido').max(255),
    email: z.string().email('Email inválido'),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
  }),
});

/**
 * Schema de validación para actualizar un cliente
 */
export const updateClientSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    company: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Schema de validación para obtener un cliente por ID
 */
export const getClientByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

/**
 * Schema de validación para eliminar un cliente
 */
export const deleteClientSchema = z.object({
  params: z.object({
    id: z.string().uuid('ID inválido'),
  }),
});

/**
 * Schema de validación para listar clientes con paginación
 */
export const listClientsSchema = z.object({
  query: z.object({
    page: z.string().optional().default('1').transform(Number),
    pageSize: z.string().optional().default('10').transform(Number),
    search: z.string().optional(),
    isActive: z.enum(['true', 'false']).optional().transform(val => val === 'true'),
  }),
});

// Tipos TypeScript inferidos
export type CreateClientInput = z.infer<typeof createClientSchema>['body'];
export type UpdateClientInput = z.infer<typeof updateClientSchema>['body'];
