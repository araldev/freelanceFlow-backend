-- ============================================
-- FreelanceFlow Backend - SQL Schema
-- Base de datos: Turso (SQLite/LibSQL)
-- ============================================

-- TABLA: users
-- Descripción: Almacena los usuarios/freelancers de la plataforma
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    company TEXT,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- TABLA: clients
-- Descripción: Almacena los clientes de cada freelancer
-- IMPORTANTE: user_id garantiza el aislamiento de datos (Multi-tenancy)
-- ============================================
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    address TEXT,
    city TEXT,
    country TEXT,
    tax_id TEXT,
    notes TEXT,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    
    -- Foreign Key con CASCADE DELETE
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Índices para optimizar queries
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_is_active ON clients(is_active);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- Índice compuesto para búsquedas por usuario y estado
CREATE INDEX IF NOT EXISTS idx_clients_user_active ON clients(user_id, is_active);

-- ============================================
-- DATOS DE EJEMPLO (OPCIONAL - Solo para testing)
-- ============================================

-- Usuario de ejemplo
INSERT OR IGNORE INTO users (id, email, password, first_name, last_name, company) 
VALUES (
    'test-user-id-123',
    'freelancer@example.com',
    '$2a$10$XQq0YqKV5q9Km6p5KQy7POmYnGj9r.EqYqX8LqXy5Qm6p5KQy7POm', -- password: "password123"
    'Juan',
    'Pérez',
    'JuanDev Studio'
);

-- Clientes de ejemplo
INSERT OR IGNORE INTO clients (id, user_id, name, email, phone, company, city, country, tax_id, is_active)
VALUES 
    (
        'client-1',
        'test-user-id-123',
        'María García',
        'maria@empresa.com',
        '+34 600 123 456',
        'Empresa Tech SL',
        'Madrid',
        'España',
        'B12345678',
        1
    ),
    (
        'client-2',
        'test-user-id-123',
        'Carlos Rodríguez',
        'carlos@startup.com',
        '+34 600 789 012',
        'StartUp Innovadora',
        'Barcelona',
        'España',
        'B87654321',
        1
    );
