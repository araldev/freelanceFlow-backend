/**
 * Tipos compartidos para respuestas de la API
 */

export interface ApiResponse<T = any> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

/**
 * Formato estándar para respuestas exitosas
 */
export const successResponse = <T>(
  data: T,
  message?: string
): ApiResponse<T> => ({
  status: 'success',
  data,
  ...(message && { message }),
});

/**
 * Formato estándar para respuestas con paginación
 */
export const paginatedResponse = <T>(
  data: T[],
  pagination: PaginationMeta,
  message?: string
): ApiResponse<T[]> => ({
  status: 'success',
  data,
  pagination,
  ...(message && { message }),
});
