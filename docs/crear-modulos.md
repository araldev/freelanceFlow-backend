# 📘 Guía para Crear Nuevos Módulos

Esta guía te muestra cómo crear nuevos módulos siguiendo la misma estructura del módulo `clients`.

## Estructura de un Módulo

Cada módulo debe tener:

```
src/modules/{nombre-modulo}/
├── {nombre}.schema.ts      # Validaciones con Zod
├── {nombre}.repository.ts  # Acceso a datos (queries SQL)
├── {nombre}.service.ts     # Lógica de negocio
├── {nombre}.controller.ts  # Manejo de HTTP requests
└── {nombre}.routes.ts      # Definición de rutas
```

## Ejemplo: Crear Módulo de Invoices (Facturas)

### 1. Crear el Schema de Base de Datos

Primero, añade la tabla en `src/config/schema.ts`:

```typescript
export const invoices = sqliteTable('invoices', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  clientId: text('client_id')
    .references(() => clients.id, { onDelete: 'set null' }),

  invoiceNumber: text('invoice_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  amount: integer('amount').notNull(), // En céntimos
  currency: text('currency').notNull().default('EUR'),
  status: text('status').notNull().default('draft'), // draft, sent, paid, overdue

  issueDate: integer('issue_date', { mode: 'timestamp' }).notNull(),
  dueDate: integer('due_date', { mode: 'timestamp' }),
  paidDate: integer('paid_date', { mode: 'timestamp' }),

  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql\`(unixepoch())\`),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .notNull()
    .default(sql\`(unixepoch())\`),
});

export type Invoice = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
```

### 2. Crear el Schema de Validación

`src/modules/invoices/invoices.schema.ts`:

```typescript
import { z } from "zod";

export const createInvoiceSchema = z.object({
  body: z.object({
    clientId: z.string().uuid().optional(),
    invoiceNumber: z.string().min(1),
    title: z.string().min(1),
    description: z.string().optional(),
    amount: z.number().positive(),
    currency: z.string().default("EUR"),
    issueDate: z.string().datetime(),
    dueDate: z.string().datetime().optional(),
  }),
});

export const updateInvoiceSchema = z.object({
  params: z.object({
    id: z.string().uuid(),
  }),
  body: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    amount: z.number().positive().optional(),
    status: z.enum(["draft", "sent", "paid", "overdue"]).optional(),
    paidDate: z.string().datetime().optional(),
  }),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>["body"];
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>["body"];
```

### 3. Crear el Repository

`src/modules/invoices/invoices.repository.ts`:

```typescript
import { db } from "../../config/db";
import { invoices, type Invoice, type NewInvoice } from "../../config/schema";
import { eq, and, desc } from "drizzle-orm";

export class InvoicesRepository {
  async create(
    userId: string,
    invoiceData: Omit<NewInvoice, "userId">,
  ): Promise<Invoice> {
    const [newInvoice] = await db
      .insert(invoices)
      .values({
        ...invoiceData,
        userId, // ← SIEMPRE incluir userId
      })
      .returning();

    return newInvoice!;
  }

  async findAll(userId: string): Promise<Invoice[]> {
    return await db
      .select()
      .from(invoices)
      .where(eq(invoices.userId, userId)) // ← SIEMPRE filtrar por userId
      .orderBy(desc(invoices.createdAt));
  }

  async findById(userId: string, invoiceId: string): Promise<Invoice | null> {
    const [invoice] = await db
      .select()
      .from(invoices)
      .where(
        and(
          eq(invoices.id, invoiceId),
          eq(invoices.userId, userId), // ← Garantiza aislamiento
        ),
      )
      .limit(1);

    return invoice || null;
  }

  async update(
    userId: string,
    invoiceId: string,
    updates: Partial<Omit<Invoice, "id" | "userId" | "createdAt">>,
  ): Promise<Invoice | null> {
    const [updatedInvoice] = await db
      .update(invoices)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
      .returning();

    return updatedInvoice || null;
  }

  async delete(userId: string, invoiceId: string): Promise<boolean> {
    const result = await db
      .delete(invoices)
      .where(and(eq(invoices.id, invoiceId), eq(invoices.userId, userId)))
      .returning();

    return result.length > 0;
  }
}
```

### 4. Crear el Service

`src/modules/invoices/invoices.service.ts`:

```typescript
import { InvoicesRepository } from "./invoices.repository";
import { AppError } from "../../middleware/errorHandler";
import type { Invoice } from "../../config/schema";
import type { CreateInvoiceInput, UpdateInvoiceInput } from "./invoices.schema";

export class InvoicesService {
  private repository: InvoicesRepository;

  constructor() {
    this.repository = new InvoicesRepository();
  }

  async createInvoice(
    userId: string,
    data: CreateInvoiceInput,
  ): Promise<Invoice> {
    // Validaciones de negocio adicionales
    if (data.amount <= 0) {
      throw new AppError(400, "El monto debe ser mayor a 0");
    }

    // Convertir fecha string a Date
    const invoiceData = {
      ...data,
      issueDate: new Date(data.issueDate),
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      amount: Math.round(data.amount * 100), // Convertir a céntimos
    };

    return await this.repository.create(userId, invoiceData);
  }

  async getInvoices(userId: string): Promise<Invoice[]> {
    return await this.repository.findAll(userId);
  }

  async getInvoiceById(userId: string, invoiceId: string): Promise<Invoice> {
    const invoice = await this.repository.findById(userId, invoiceId);

    if (!invoice) {
      throw new AppError(404, "Factura no encontrada");
    }

    return invoice;
  }

  async updateInvoice(
    userId: string,
    invoiceId: string,
    data: UpdateInvoiceInput,
  ): Promise<Invoice> {
    const exists = await this.repository.findById(userId, invoiceId);
    if (!exists) {
      throw new AppError(404, "Factura no encontrada");
    }

    // Lógica de negocio: no permitir editar facturas pagadas
    if (exists.status === "paid" && data.status !== "paid") {
      throw new AppError(400, "No se puede modificar una factura pagada");
    }

    const updated = await this.repository.update(userId, invoiceId, data);

    if (!updated) {
      throw new AppError(500, "Error al actualizar la factura");
    }

    return updated;
  }

  async deleteInvoice(userId: string, invoiceId: string): Promise<void> {
    const exists = await this.repository.findById(userId, invoiceId);
    if (!exists) {
      throw new AppError(404, "Factura no encontrada");
    }

    const deleted = await this.repository.delete(userId, invoiceId);

    if (!deleted) {
      throw new AppError(500, "Error al eliminar la factura");
    }
  }
}
```

### 5. Crear el Controller

`src/modules/invoices/invoices.controller.ts`:

```typescript
import { Request, Response, NextFunction } from "express";
import { InvoicesService } from "./invoices.service";
import { catchAsync } from "../../middleware/errorHandler";
import { successResponse } from "../../shared/types/apiResponse";

export class InvoicesController {
  private service: InvoicesService;

  constructor() {
    this.service = new InvoicesService();
  }

  getInvoices = catchAsync(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const invoices = await this.service.getInvoices(userId);
    res.status(200).json(successResponse(invoices));
  });

  createInvoice = catchAsync(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const invoice = await this.service.createInvoice(userId, req.body);
    res.status(201).json(successResponse(invoice));
  });

  getInvoiceById = catchAsync(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const invoice = await this.service.getInvoiceById(userId, id);
    res.status(200).json(successResponse(invoice));
  });

  updateInvoice = catchAsync(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    const invoice = await this.service.updateInvoice(userId, id, req.body);
    res.status(200).json(successResponse(invoice));
  });

  deleteInvoice = catchAsync(async (req: Request, res: Response) => {
    const userId = req.userId!;
    const { id } = req.params;
    await this.service.deleteInvoice(userId, id);
    res.status(200).json(successResponse(null, "Factura eliminada"));
  });
}
```

### 6. Crear las Routes

`src/modules/invoices/invoices.routes.ts`:

```typescript
import { Router } from "express";
import { InvoicesController } from "./invoices.controller";
import { authenticate } from "../../middleware/auth";
import { validateRequest } from "../../middleware/validation";
import { createInvoiceSchema, updateInvoiceSchema } from "./invoices.schema";

const router = Router();
const controller = new InvoicesController();

router.get("/", authenticate, controller.getInvoices);
router.post(
  "/",
  authenticate,
  validateRequest(createInvoiceSchema),
  controller.createInvoice,
);
router.get("/:id", authenticate, controller.getInvoiceById);
router.put(
  "/:id",
  authenticate,
  validateRequest(updateInvoiceSchema),
  controller.updateInvoice,
);
router.delete("/:id", authenticate, controller.deleteInvoice);

export default router;
```

### 7. Registrar las Rutas en app.ts

En `src/app.ts`, añade:

```typescript
import invoicesRouter from "./modules/invoices/invoices.routes";

// ...

app.use(`/api/${API_VERSION}/invoices`, invoicesRouter);
```

### 8. Actualizar el Schema SQL

Añade en `database/schema.sql`:

```sql
CREATE TABLE IF NOT EXISTS invoices (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    client_id TEXT,
    invoice_number TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    amount INTEGER NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    status TEXT NOT NULL DEFAULT 'draft',
    issue_date INTEGER NOT NULL,
    due_date INTEGER,
    paid_date INTEGER,
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
```

### 9. Push a la Base de Datos

```bash
npm run db:push
```

## ✅ Checklist para Nuevos Módulos

- [ ] Crear tabla en `src/config/schema.ts`
- [ ] Crear `{nombre}.schema.ts` con validaciones Zod
- [ ] Crear `{nombre}.repository.ts` con queries que **SIEMPRE** filtren por `userId`
- [ ] Crear `{nombre}.service.ts` con lógica de negocio
- [ ] Crear `{nombre}.controller.ts` extrayendo `userId` del request
- [ ] Crear `{nombre}.routes.ts` con middleware `authenticate`
- [ ] Registrar rutas en `src/app.ts`
- [ ] Añadir SQL en `database/schema.sql`
- [ ] Hacer push del schema a Turso

## 🔒 Regla de Oro: Multi-tenancy

**SIEMPRE** incluye el `userId` en:

- ✅ Todas las inserts: `{ ...data, userId }`
- ✅ Todas las queries: `WHERE user_id = ?`
- ✅ Foreign Keys cuando aplica

**NUNCA** hagas queries sin filtrar por `userId` en módulos que pertenecen a usuarios.
