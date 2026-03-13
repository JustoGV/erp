# Documentación Completa de API — ERP System

> **Generada automáticamente** a partir del análisis cruzado del frontend (Next.js) y backend (NestJS).
>
> **Base URL:** `http://localhost:3001/api/v1`
>
> **Autenticación:** Bearer JWT en header `Authorization` (excepto endpoints marcados `@Public`).
>
> **Paginación estándar:** Todos los endpoints de listado aceptan `page` (default 1), `limit` (default 20, max 100). Respuesta: `{ data: T[], meta: { page, limit, total, totalPages } }`.

---

## Tabla de Contenidos

1. [Auth](#1-auth)
2. [Configuración (Empresas, Locales, Usuarios)](#2-configuración)
3. [Ventas](#3-ventas)
4. [Compras](#4-compras)
5. [Inventario](#5-inventario)
6. [Finanzas](#6-finanzas)
7. [Producción](#7-producción)
8. [RRHH](#8-rrhh)
9. [Reportes](#9-reportes)
10. [Resumen de Gaps y Tareas Pendientes](#10-gaps-y-tareas-pendientes)

---

## 1. Auth

| Método | Ruta            | Descripción                            | Auth      | Estado |
| ------ | --------------- | -------------------------------------- | --------- | ------ |
| `POST` | `/auth/login`   | Login con email + password             | `@Public` | ✅ OK  |
| `POST` | `/auth/refresh` | Renovar access token con refresh token | `@Public` | ✅ OK  |
| `POST` | `/auth/logout`  | Cerrar sesión (invalida refresh token) | Bearer    | ✅ OK  |
| `GET`  | `/auth/profile` | Obtener perfil del usuario autenticado | Bearer    | ✅ OK  |

**Request Login:**

```json
{ "email": "string", "password": "string" }
```

**Response Login:**

```json
{
  "access_token": "string",
  "refresh_token": "string",
  "user": { "id", "email", "nombre", "rol", "empresa", "locales[]" }
}
```

---

## 2. Configuración

### 2.1 Empresas — `/empresas`

| Método  | Ruta            | Descripción        | Auth           | Estado |
| ------- | --------------- | ------------------ | -------------- | ------ |
| `GET`   | `/empresas`     | Listar empresas    | Bearer         | ✅ OK  |
| `GET`   | `/empresas/:id` | Detalle empresa    | Bearer         | ✅ OK  |
| `POST`  | `/empresas`     | Crear empresa      | Bearer + Admin | ✅ OK  |
| `PATCH` | `/empresas/:id` | Actualizar empresa | Bearer + Admin | ✅ OK  |

### 2.2 Locales — `/locales`

| Método  | Ruta           | Query Params          | Descripción                         | Auth           | Estado |
| ------- | -------------- | --------------------- | ----------------------------------- | -------------- | ------ |
| `GET`   | `/locales`     | `page, limit, search` | Listar locales (search: name, city) | Bearer         | ✅ OK  |
| `GET`   | `/locales/:id` | —                     | Detalle local                       | Bearer         | ✅ OK  |
| `POST`  | `/locales`     | —                     | Crear local                         | Bearer + Admin | ✅ OK  |
| `PATCH` | `/locales/:id` | —                     | Actualizar local                    | Bearer + Admin | ✅ OK  |

### 2.3 Usuarios — `/usuarios`

| Método  | Ruta                     | Query Params          | Descripción                             | Auth           | Estado |
| ------- | ------------------------ | --------------------- | --------------------------------------- | -------------- | ------ |
| `GET`   | `/usuarios`              | `page, limit, search` | Listar usuarios (search: nombre, email) | Bearer + Admin | ✅ OK  |
| `GET`   | `/usuarios/:id`          | —                     | Detalle usuario                         | Bearer + Admin | ✅ OK  |
| `POST`  | `/usuarios`              | —                     | Crear usuario                           | Bearer + Admin | ✅ OK  |
| `PATCH` | `/usuarios/:id`          | —                     | Actualizar usuario                      | Bearer         | ✅ OK  |
| `PATCH` | `/usuarios/:id/password` | —                     | Cambiar contraseña                      | Bearer         | ✅ OK  |

---

## 3. Ventas

### 3.1 Clientes — `/clientes`

| Método  | Ruta                   | Query Params                           | Descripción                                 | Auth   | Estado |
| ------- | ---------------------- | -------------------------------------- | ------------------------------------------- | ------ | ------ |
| `GET`   | `/clientes`            | `page, limit, search, localId, active` | Listar clientes (search: name, code, taxId) | Bearer | ✅ OK  |
| `GET`   | `/clientes/:id`        | —                                      | Detalle cliente                             | Bearer | ✅ OK  |
| `GET`   | `/clientes/:id/saldos` | —                                      | Saldos pendientes del cliente               | Bearer | ✅ OK  |
| `POST`  | `/clientes`            | —                                      | Crear cliente                               | Bearer | ✅ OK  |
| `PATCH` | `/clientes/:id`        | —                                      | Actualizar cliente                          | Bearer | ✅ OK  |

### 3.2 Presupuestos — `/presupuestos`

| Método  | Ruta                                 | Query Params                   | Descripción                    | Auth   | Estado                               |
| ------- | ------------------------------------ | ------------------------------ | ------------------------------ | ------ | ------------------------------------ |
| `GET`   | `/presupuestos`                      | `page, limit, localId, search` | Listar presupuestos            | Bearer | ⚠️ search no implementado en backend |
| `GET`   | `/presupuestos/:id`                  | —                              | Detalle presupuesto con items  | Bearer | ✅ OK                                |
| `POST`  | `/presupuestos`                      | `localId` (query)              | Crear presupuesto              | Bearer | ✅ OK                                |
| `POST`  | `/presupuestos/:id/convertir-pedido` | —                              | Convertir presupuesto a pedido | Bearer | ✅ OK                                |
| `PATCH` | `/presupuestos/:id/estado`           | —                              | Cambiar estado                 | Bearer | ✅ OK                                |

**Body POST crear:**

```json
{
  "clienteId": "uuid",
  "validezDias": 30,
  "observaciones": "string",
  "items": [
    {
      "productoId": "uuid",
      "cantidad": 1,
      "precioUnitario": 100,
      "descuento": 0
    }
  ]
}
```

### 3.3 Pedidos — `/pedidos`

| Método | Ruta                   | Query Params                   | Descripción    | Auth   | Estado                               |
| ------ | ---------------------- | ------------------------------ | -------------- | ------ | ------------------------------------ |
| `GET`  | `/pedidos`             | `page, limit, localId, search` | Listar pedidos | Bearer | ⚠️ search no implementado en backend |
| `GET`  | `/pedidos/:id`         | —                              | Detalle pedido | Bearer | ✅ OK                                |
| `POST` | `/pedidos/:id/aprobar` | —                              | Aprobar pedido | Bearer | ✅ OK                                |

> **Nota:** Los pedidos se crean indirectamente al convertir un presupuesto. No hay `POST /pedidos`.

### 3.4 Facturas — `/facturas`

| Método   | Ruta                     | Query Params                   | Descripción                         | Auth   | Estado                               |
| -------- | ------------------------ | ------------------------------ | ----------------------------------- | ------ | ------------------------------------ |
| `GET`    | `/facturas`              | `page, limit, localId, search` | Listar facturas                     | Bearer | ⚠️ search no implementado en backend |
| `GET`    | `/facturas/:id`          | —                              | Detalle factura                     | Bearer | ✅ OK                                |
| `POST`   | `/facturas/desde-pedido` | —                              | Crear factura desde pedido aprobado | Bearer | ✅ OK                                |
| `DELETE` | `/facturas/:id/anular`   | —                              | Anular factura                      | Bearer | ✅ OK                                |

**Body POST:**

```json
{ "pedidoId": "uuid" }
```

**Body DELETE anular:**

```json
{ "motivo": "string" }
```

### 3.5 Cobranzas — `/cobranzas`

| Método | Ruta         | Query Params                   | Descripción        | Auth   | Estado                               |
| ------ | ------------ | ------------------------------ | ------------------ | ------ | ------------------------------------ |
| `GET`  | `/cobranzas` | `page, limit, localId, search` | Listar cobranzas   | Bearer | ⚠️ search no implementado en backend |
| `POST` | `/cobranzas` | —                              | Registrar cobranza | Bearer | ✅ OK                                |

### 3.6 Seguimiento de Clientes

> **Estado:** Página frontend placeholder (`EnPreparacion`). No hay endpoint backend dedicado. Se podría usar `GET /clientes/:id/saldos` como base o crear un módulo nuevo de seguimientos.

---

## 4. Compras

### 4.1 Proveedores — `/proveedores`

| Método  | Ruta                     | Query Params                   | Descripción                                    | Auth   | Estado |
| ------- | ------------------------ | ------------------------------ | ---------------------------------------------- | ------ | ------ |
| `GET`   | `/proveedores`           | `page, limit, search, localId` | Listar proveedores (search: name, code, taxId) | Bearer | ✅ OK  |
| `GET`   | `/proveedores/:id`       | —                              | Detalle proveedor                              | Bearer | ✅ OK  |
| `GET`   | `/proveedores/:id/deuda` | —                              | Deuda total del proveedor                      | Bearer | ✅ OK  |
| `POST`  | `/proveedores`           | —                              | Crear proveedor                                | Bearer | ✅ OK  |
| `PATCH` | `/proveedores/:id`       | —                              | Actualizar proveedor                           | Bearer | ✅ OK  |

### 4.2 Requerimientos — `/requerimientos`

| Método  | Ruta                            | Query Params                   | Descripción             | Auth   | Estado                               |
| ------- | ------------------------------- | ------------------------------ | ----------------------- | ------ | ------------------------------------ |
| `GET`   | `/requerimientos`               | `page, limit, localId, search` | Listar requerimientos   | Bearer | ⚠️ search no implementado en backend |
| `GET`   | `/requerimientos/:id`           | —                              | Detalle requerimiento   | Bearer | ✅ OK                                |
| `POST`  | `/requerimientos`               | `localId` (query)              | Crear requerimiento     | Bearer | ✅ OK                                |
| `PATCH` | `/requerimientos/:id/autorizar` | —                              | Autorizar requerimiento | Bearer | ✅ OK                                |

### 4.3 Órdenes de Compra — `/ordenes-compra`

| Método  | Ruta                          | Query Params                   | Descripción    | Auth   | Estado                               |
| ------- | ----------------------------- | ------------------------------ | -------------- | ------ | ------------------------------------ |
| `GET`   | `/ordenes-compra`             | `page, limit, localId, search` | Listar órdenes | Bearer | ⚠️ search no implementado en backend |
| `GET`   | `/ordenes-compra/:id`         | —                              | Detalle OC     | Bearer | ✅ OK                                |
| `POST`  | `/ordenes-compra`             | `localId` (query)              | Crear OC       | Bearer | ✅ OK                                |
| `PATCH` | `/ordenes-compra/:id/aprobar` | —                              | Aprobar OC     | Bearer | ✅ OK                                |

### 4.4 Recepciones — `/recepciones`

| Método | Ruta           | Query Params                   | Descripción                       | Auth   | Estado                               |
| ------ | -------------- | ------------------------------ | --------------------------------- | ------ | ------------------------------------ |
| `GET`  | `/recepciones` | `page, limit, localId, search` | Listar recepciones                | Bearer | ⚠️ search no implementado en backend |
| `POST` | `/recepciones` | —                              | Registrar recepción de mercadería | Bearer | ✅ OK                                |

### 4.5 Pagos a Proveedores — `/pagos-proveedor`

| Método | Ruta               | Query Params                   | Descripción    | Auth   | Estado                               |
| ------ | ------------------ | ------------------------------ | -------------- | ------ | ------------------------------------ |
| `GET`  | `/pagos-proveedor` | `page, limit, localId, search` | Listar pagos   | Bearer | ⚠️ search no implementado en backend |
| `POST` | `/pagos-proveedor` | —                              | Registrar pago | Bearer | ✅ OK                                |

---

## 5. Inventario

### 5.1 Categorías — `/categorias`

| Método  | Ruta              | Descripción          | Auth           | Estado |
| ------- | ----------------- | -------------------- | -------------- | ------ |
| `GET`   | `/categorias`     | Listar categorías    | Bearer         | ✅ OK  |
| `GET`   | `/categorias/:id` | Detalle categoría    | Bearer         | ✅ OK  |
| `POST`  | `/categorias`     | Crear categoría      | Bearer + Admin | ✅ OK  |
| `PATCH` | `/categorias/:id` | Actualizar categoría | Bearer + Admin | ✅ OK  |

### 5.2 Productos — `/productos`

| Método  | Ruta             | Query Params                                                 | Descripción                                        | Auth           | Estado |
| ------- | ---------------- | ------------------------------------------------------------ | -------------------------------------------------- | -------------- | ------ |
| `GET`   | `/productos`     | `page, limit, search, localId, tipo, categoriaId, stockBajo` | Listar productos (search: name, code, description) | Bearer         | ✅ OK  |
| `GET`   | `/productos/:id` | —                                                            | Detalle producto con stock por local               | Bearer         | ✅ OK  |
| `POST`  | `/productos`     | —                                                            | Crear producto                                     | Bearer + Admin | ✅ OK  |
| `PATCH` | `/productos/:id` | —                                                            | Actualizar producto                                | Bearer + Admin | ✅ OK  |

### 5.3 Depósitos — `/depositos`

| Método  | Ruta             | Query Params      | Descripción         | Auth           | Estado |
| ------- | ---------------- | ----------------- | ------------------- | -------------- | ------ |
| `GET`   | `/depositos`     | `localId, search` | Listar depósitos    | Bearer         | ✅ OK  |
| `GET`   | `/depositos/:id` | —                 | Detalle depósito    | Bearer         | ✅ OK  |
| `POST`  | `/depositos`     | —                 | Crear depósito      | Bearer + Admin | ✅ OK  |
| `PATCH` | `/depositos/:id` | —                 | Actualizar depósito | Bearer + Admin | ✅ OK  |

### 5.4 Movimientos de Stock — `/movimientos-stock`

| Método | Ruta                                      | Query Params                         | Descripción                           | Auth   | Estado                               |
| ------ | ----------------------------------------- | ------------------------------------ | ------------------------------------- | ------ | ------------------------------------ |
| `GET`  | `/movimientos-stock`                      | `page, limit, localId, tipo, search` | Listar movimientos                    | Bearer | ⚠️ search no implementado en backend |
| `GET`  | `/movimientos-stock/producto/:productoId` | —                                    | Movimientos de un producto específico | Bearer | ✅ OK                                |

### 5.5 Stock y Alertas — `/inventario`

| Método | Ruta                                     | Query Params            | Descripción                               | Auth   | Estado |
| ------ | ---------------------------------------- | ----------------------- | ----------------------------------------- | ------ | ------ |
| `GET`  | `/inventario/stock/:localId`             | —                       | Stock actual por local                    | Bearer | ✅ OK  |
| `GET`  | `/inventario/stock/producto/:productoId` | —                       | Stock de un producto en todos los locales | Bearer | ✅ OK  |
| `GET`  | `/inventario/alertas`                    | `localId` (opcional)    | Alertas de stock bajo                     | Bearer | ✅ OK  |
| `POST` | `/inventario/ajuste`                     | `localId` (query)       | Ajuste de inventario                      | Bearer | ✅ OK  |
| `POST` | `/inventario/transferencia`              | `localOrigenId` (query) | Transferencia entre locales               | Bearer | ✅ OK  |

### 5.6 Valorización

> **Estado:** Página frontend placeholder (`EnPreparacion`). No hay endpoint backend dedicado. Se podría calcular desde `GET /inventario/stock/:localId` con costos de productos.

---

## 6. Finanzas

### 6.1 Plan de Cuentas — `/plan-cuentas`

| Método | Ruta                      | Query Params           | Descripción                  | Auth   | Estado |
| ------ | ------------------------- | ---------------------- | ---------------------------- | ------ | ------ |
| `GET`  | `/plan-cuentas`           | `empresaId` (opcional) | Árbol completo de cuentas    | Bearer | ✅ OK  |
| `GET`  | `/plan-cuentas/:id`       | —                      | Detalle cuenta               | Bearer | ✅ OK  |
| `POST` | `/plan-cuentas`           | —                      | Crear cuenta contable        | Bearer | ✅ OK  |
| `GET`  | `/plan-cuentas/:id/mayor` | `desde, hasta`         | Mayor contable de una cuenta | Bearer | ✅ OK  |

### 6.2 Asientos Contables — `/asientos`

| Método  | Ruta                      | Query Params           | Descripción                | Auth   | Estado                  |
| ------- | ------------------------- | ---------------------- | -------------------------- | ------ | ----------------------- |
| `GET`   | `/asientos`               | `page, limit, localId` | Listar asientos            | Bearer | ✅ OK                   |
| `GET`   | `/asientos/:id`           | —                      | Detalle asiento con líneas | Bearer | ✅ OK                   |
| `POST`  | `/asientos`               | `localId` (query)      | Crear asiento manual       | Bearer | ✅ OK                   |
| `PATCH` | `/asientos/:id/confirmar` | —                      | Confirmar asiento borrador | Bearer | ⛔ NO EXISTE en backend |
| `PATCH` | `/asientos/:id/anular`    | —                      | Anular asiento             | Bearer | ⛔ NO EXISTE en backend |

> **⚠️ IMPORTANTE:** El frontend tiene los métodos `confirmar` y `anular` definidos en el service, pero el backend NO los implementa. Deben agregarse al `AsientosController` y `AsientosService`.

### 6.3 Bancos — `/bancos`

| Método | Ruta                              | Query Params                | Descripción                        | Auth   | Estado |
| ------ | --------------------------------- | --------------------------- | ---------------------------------- | ------ | ------ |
| `GET`  | `/bancos/cuentas`                 | —                           | Listar cuentas bancarias con saldo | Bearer | ✅ OK  |
| `GET`  | `/bancos/cuentas/:id/movimientos` | `page, limit, desde, hasta` | Movimientos de cuenta bancaria     | Bearer | ✅ OK  |
| `POST` | `/bancos/movimientos`             | —                           | Registrar movimiento bancario      | Bearer | ✅ OK  |

> **Nota:** Página frontend `finanzas/bancos` actualmente es placeholder (`EnPreparacion`).

### 6.4 Caja — `/caja`

| Método | Ruta                         | Query Params                | Descripción              | Auth   | Estado |
| ------ | ---------------------------- | --------------------------- | ------------------------ | ------ | ------ |
| `GET`  | `/caja/:localId`             | —                           | Saldo actual de caja     | Bearer | ✅ OK  |
| `GET`  | `/caja/:localId/movimientos` | `page, limit, desde, hasta` | Movimientos de caja      | Bearer | ✅ OK  |
| `POST` | `/caja/:localId/movimiento`  | —                           | Registrar ingreso/egreso | Bearer | ✅ OK  |

**Body POST:**

```json
{
  "tipo": "INGRESO" | "EGRESO",
  "monto": 1500.00,
  "concepto": "string",
  "referencia": "string (opcional)"
}
```

### 6.5 Cuentas por Cobrar — `/cuentas-cobrar`

| Método | Ruta                      | Query Params                   | Descripción                    | Auth   | Estado |
| ------ | ------------------------- | ------------------------------ | ------------------------------ | ------ | ------ |
| `GET`  | `/cuentas-cobrar`         | `page, limit, localId, estado` | Listar CxC                     | Bearer | ✅ OK  |
| `GET`  | `/cuentas-cobrar/resumen` | `localId` (opcional)           | Resumen por estado/vencimiento | Bearer | ✅ OK  |

### 6.6 Cuentas por Pagar — `/cuentas-pagar`

| Método | Ruta                     | Query Params                   | Descripción                    | Auth   | Estado |
| ------ | ------------------------ | ------------------------------ | ------------------------------ | ------ | ------ |
| `GET`  | `/cuentas-pagar`         | `page, limit, localId, estado` | Listar CxP                     | Bearer | ✅ OK  |
| `GET`  | `/cuentas-pagar/resumen` | `localId` (opcional)           | Resumen por estado/vencimiento | Bearer | ✅ OK  |

### 6.7 Retenciones — `/retenciones`

| Método | Ruta           | Query Params                 | Descripción         | Auth   | Estado |
| ------ | -------------- | ---------------------------- | ------------------- | ------ | ------ |
| `GET`  | `/retenciones` | `page, limit, localId, tipo` | Listar retenciones  | Bearer | ✅ OK  |
| `POST` | `/retenciones` | `localId` (query)            | Registrar retención | Bearer | ✅ OK  |

---

## 7. Producción

### 7.1 Materiales de Producción — `/materiales-produccion`

| Método  | Ruta                         | Descripción         | Auth           | Estado |
| ------- | ---------------------------- | ------------------- | -------------- | ------ |
| `GET`   | `/materiales-produccion`     | Listar materiales   | Bearer         | ✅ OK  |
| `POST`  | `/materiales-produccion`     | Crear material      | Bearer + Admin | ✅ OK  |
| `PATCH` | `/materiales-produccion/:id` | Actualizar material | Bearer + Admin | ✅ OK  |

> Sin paginación ni búsqueda. Query param `localId` en POST.

### 7.2 BOM (Bill of Materials) — `/bom`

| Método | Ruta       | Descripción                 | Auth           | Estado |
| ------ | ---------- | --------------------------- | -------------- | ------ |
| `GET`  | `/bom`     | Listar BOMs                 | Bearer         | ✅ OK  |
| `GET`  | `/bom/:id` | Detalle BOM con componentes | Bearer         | ✅ OK  |
| `POST` | `/bom`     | Crear BOM                   | Bearer + Admin | ✅ OK  |

> Query param `localId` en POST.

### 7.3 Órdenes de Producción — `/ordenes-produccion`

| Método  | Ruta                                | Descripción                  | Auth           | Estado |
| ------- | ----------------------------------- | ---------------------------- | -------------- | ------ |
| `GET`   | `/ordenes-produccion`               | Listar órdenes               | Bearer         | ✅ OK  |
| `GET`   | `/ordenes-produccion/:id`           | Detalle orden                | Bearer         | ✅ OK  |
| `POST`  | `/ordenes-produccion`               | Crear orden                  | Bearer + Admin | ✅ OK  |
| `PATCH` | `/ordenes-produccion/:id/iniciar`   | Iniciar producción           | Bearer + Admin | ✅ OK  |
| `PATCH` | `/ordenes-produccion/:id/finalizar` | Finalizar y registrar output | Bearer + Admin | ✅ OK  |
| `PATCH` | `/ordenes-produccion/:id/cancelar`  | Cancelar orden               | Bearer + Admin | ✅ OK  |

> Query param `localId` en POST.

### 7.4 Planificación — `/planificacion`

| Método | Ruta                        | Query Params                | Descripción                            | Auth   | Estado |
| ------ | --------------------------- | --------------------------- | -------------------------------------- | ------ | ------ |
| `GET`  | `/planificacion`            | `desde, hasta` (requeridos) | Calendario de producción               | Bearer | ✅ OK  |
| `GET`  | `/planificacion/materiales` | —                           | Verificar disponibilidad de materiales | Bearer | ✅ OK  |

> **Nota:** Página frontend `produccion/planificacion` es placeholder (`EnPreparacion`).

### 7.5 Máquinas

> **Estado:** Página frontend placeholder (`EnPreparacion`). No existe módulo backend para máquinas. Sería necesario crear un CRUD completo si se requiere.

---

## 8. RRHH

### 8.1 Empleados — `/empleados`

| Método  | Ruta                           | Query Params                   | Descripción                                                 | Auth           | Estado |
| ------- | ------------------------------ | ------------------------------ | ----------------------------------------------------------- | -------------- | ------ |
| `GET`   | `/empleados`                   | `page, limit, search, localId` | Listar empleados (search: name, code, position, department) | Bearer         | ✅ OK  |
| `GET`   | `/empleados/:id`               | —                              | Detalle empleado                                            | Bearer         | ✅ OK  |
| `GET`   | `/empleados/:id/resumen-horas` | `mes, anio`                    | Resumen de horas trabajadas                                 | Bearer         | ✅ OK  |
| `POST`  | `/empleados`                   | `localId` (query)              | Crear empleado                                              | Bearer + Admin | ✅ OK  |
| `PATCH` | `/empleados/:id`               | —                              | Actualizar empleado                                         | Bearer + Admin | ✅ OK  |

### 8.2 Asistencias — `/asistencias`

| Método | Ruta           | Query Params                              | Descripción          | Auth   | Estado                               |
| ------ | -------------- | ----------------------------------------- | -------------------- | ------ | ------------------------------------ |
| `GET`  | `/asistencias` | `page, limit, empleadoId, fecha, localId` | Listar asistencias   | Bearer | ⚠️ search no implementado en backend |
| `POST` | `/asistencias` | —                                         | Registrar asistencia | Bearer | ✅ OK                                |

> Frontend envía `search` pero el backend filtra por `empleadoId` y `fecha` exacta.

### 8.3 Registro de Horas — `/horas`

| Método | Ruta     | Query Params                       | Descripción     | Auth   | Estado                               |
| ------ | -------- | ---------------------------------- | --------------- | ------ | ------------------------------------ |
| `GET`  | `/horas` | `page, limit, empleadoId, localId` | Listar horas    | Bearer | ⚠️ search no implementado en backend |
| `POST` | `/horas` | —                                  | Registrar horas | Bearer | ✅ OK                                |

> Frontend envía `search` pero el backend solo filtra por `empleadoId`.

### 8.4 Liquidaciones — `/liquidaciones`

| Método  | Ruta                         | Query Params           | Descripción          | Auth           | Estado                               |
| ------- | ---------------------------- | ---------------------- | -------------------- | -------------- | ------------------------------------ |
| `GET`   | `/liquidaciones`             | `page, limit, localId` | Listar liquidaciones | Bearer         | ⚠️ search no implementado en backend |
| `GET`   | `/liquidaciones/:id`         | —                      | Detalle liquidación  | Bearer         | ✅ OK                                |
| `POST`  | `/liquidaciones`             | —                      | Generar liquidación  | Bearer + Admin | ✅ OK                                |
| `PATCH` | `/liquidaciones/:id/aprobar` | —                      | Aprobar liquidación  | Bearer + Admin | ✅ OK                                |

### 8.5 Vacaciones — `/vacaciones`

| Método  | Ruta                       | Descripción               | Auth           | Estado |
| ------- | -------------------------- | ------------------------- | -------------- | ------ |
| `GET`   | `/vacaciones/empleado/:id` | Vacaciones de un empleado | Bearer         | ✅ OK  |
| `POST`  | `/vacaciones`              | Solicitar vacaciones      | Bearer         | ✅ OK  |
| `PATCH` | `/vacaciones/:id/aprobar`  | Aprobar vacaciones        | Bearer + Admin | ✅ OK  |
| `PATCH` | `/vacaciones/:id/rechazar` | Rechazar vacaciones       | Bearer + Admin | ✅ OK  |

> **Nota:** Página frontend `rrhh/vacaciones` es placeholder (`EnPreparacion`). Los endpoints backend están completos.

---

## 9. Reportes

### 9.1 Dashboard — `/reportes/dashboard`

| Método | Ruta                  | Descripción                    | Auth   | Estado |
| ------ | --------------------- | ------------------------------ | ------ | ------ |
| `GET`  | `/reportes/dashboard` | KPIs ejecutivos del mes actual | Bearer | ✅ OK  |

**Response:**

```json
{
  "data": {
    "ventasMes": { "total": 0, "cantidad": 0 },
    "comprasMes": { "total": 0, "cantidad": 0 },
    "stockAlertas": 0,
    "ordenesProdPendientes": 0
  }
}
```

### 9.2 Reportes por Módulo

| Método | Ruta                   | Query Params                                | Descripción                       | Auth                    | Estado |
| ------ | ---------------------- | ------------------------------------------- | --------------------------------- | ----------------------- | ------ |
| `GET`  | `/reportes/ventas`     | `desde, hasta, localId, clienteId, formato` | Reporte de ventas por cliente/mes | Bearer                  | ✅ OK  |
| `GET`  | `/reportes/compras`    | `desde, hasta, proveedorId, formato`        | Reporte de compras por proveedor  | Bearer                  | ✅ OK  |
| `GET`  | `/reportes/inventario` | `localId, formato`                          | Valorización de stock actual      | Bearer                  | ✅ OK  |
| `GET`  | `/reportes/rrhh`       | `desde, hasta, empleadoId, formato`         | Reporte de nómina                 | Bearer + Admin          | ✅ OK  |
| `GET`  | `/reportes/resultados` | `desde, hasta`                              | Estado de resultados (contable)   | Bearer + Admin/Contable | ✅ OK  |

**Formatos soportados:** `json` (default), `xlsx` (descarga Excel binaria).

---

## 10. Gaps y Tareas Pendientes

### 🔴 Endpoints que debe implementar el Backend

#### 10.1 Asientos — Confirmar y Anular

El frontend tiene los métodos pero el backend NO los implementa:

```
PATCH /asientos/:id/confirmar   → Cambiar estado de BORRADOR a CONFIRMADO
PATCH /asientos/:id/anular      → Cambiar estado a ANULADO (asiento de reversión)
```

#### 10.2 Implementar filtrado por `search` en 12 servicios backend

Todos estos servicios reciben `search` desde el frontend vía `PaginationDto` pero **NO lo usan en su Prisma query**:

| Servicio                  | Campos sugeridos para search             |
| ------------------------- | ---------------------------------------- |
| `PresupuestosService`     | número, cliente.name                     |
| `PedidosService`          | número, cliente.name                     |
| `FacturasService`         | número, cliente.name, cliente.taxId      |
| `CobranzasService`        | número, cliente.name                     |
| `RequerimientosService`   | número, descripción, solicitante         |
| `OrdenesCompraService`    | número, proveedor.name                   |
| `RecepcionesService`      | número, ordenCompra.número               |
| `PagosProveedorService`   | número, proveedor.name                   |
| `MovimientosStockService` | producto.name, producto.code, referencia |
| `AsistenciasService`      | empleado.name, empleado.code             |
| `HorasService`            | empleado.name, descripción               |
| `LiquidacionesService`    | empleado.name, empleado.code             |

**Patrón de implementación (ya usado en proveedores, clientes, empleados):**

```typescript
if (pagination.search) {
  where.OR = [
    { numero: { contains: pagination.search, mode: "insensitive" } },
    { cliente: { name: { contains: pagination.search, mode: "insensitive" } } },
  ];
}
```

### 🟡 Páginas Frontend Placeholder (EnPreparacion)

Estas 5 páginas existen en el frontend pero solo muestran un placeholder:

| Página                      | Backend disponible               | Acción necesaria                                      |
| --------------------------- | -------------------------------- | ----------------------------------------------------- |
| `/finanzas/bancos`          | ✅ Endpoints listos              | Implementar UI (CRUD cuentas bancarias + movimientos) |
| `/produccion/planificacion` | ✅ Endpoints listos              | Implementar UI (calendario + verificar materiales)    |
| `/produccion/maquinas`      | ⛔ No existe backend             | Crear CRUD backend + implementar UI                   |
| `/inventario/valorizacion`  | Parcial (`/reportes/inventario`) | Implementar UI consumiendo reporte inventario         |
| `/ventas/seguimiento`       | Parcial (`/clientes/:id/saldos`) | Definir modelo de seguimientos o usar saldos          |
| `/rrhh/vacaciones`          | ✅ Endpoints listos              | Implementar UI (solicitar, listar, aprobar/rechazar)  |

### 🟢 Corrección Aplicada en esta Auditoría

| Archivo                            | Cambio                                                               | Motivo                                      |
| ---------------------------------- | -------------------------------------------------------------------- | ------------------------------------------- |
| `lib/services/finanzas.service.ts` | `POST /caja/:localId/movimientos` → `POST /caja/:localId/movimiento` | Backend usa singular, frontend usaba plural |

### 📋 Resumen de Estado por Módulo

| Módulo           | Endpoints | Frontend    | Conexión | Pendiente                   |
| ---------------- | --------- | ----------- | -------- | --------------------------- |
| Auth             | 4         | ✅          | ✅       | —                           |
| Empresas         | 4         | ✅          | ✅       | —                           |
| Locales          | 4         | ✅          | ✅       | —                           |
| Usuarios         | 5         | ✅          | ✅       | —                           |
| Clientes         | 5         | ✅          | ✅       | —                           |
| Presupuestos     | 5         | ✅          | ✅       | search en backend           |
| Pedidos          | 3         | ✅          | ✅       | search en backend           |
| Facturas         | 4         | ✅          | ✅       | search en backend           |
| Cobranzas        | 2         | ✅          | ✅       | search en backend           |
| Proveedores      | 5         | ✅          | ✅       | —                           |
| Requerimientos   | 4         | ✅          | ✅       | search en backend           |
| Órdenes Compra   | 4         | ✅          | ✅       | search en backend           |
| Recepciones      | 2         | ✅          | ✅       | search en backend           |
| Pagos Proveedor  | 2         | ✅          | ✅       | search en backend           |
| Categorías       | 4         | ✅          | ✅       | —                           |
| Productos        | 4         | ✅          | ✅       | —                           |
| Depósitos        | 4         | ✅          | ✅       | —                           |
| Mov. Stock       | 2         | ✅          | ✅       | search en backend           |
| Stock/Alertas    | 5         | ✅          | ✅       | —                           |
| Plan Cuentas     | 4         | ✅          | ✅       | —                           |
| Asientos         | 3 (+2)    | ✅          | ⚠️       | confirmar/anular en backend |
| Bancos           | 3         | Placeholder | —        | Implementar UI              |
| Caja             | 3         | ✅          | ✅       | —                           |
| CxC              | 2         | ✅          | ✅       | —                           |
| CxP              | 2         | ✅          | ✅       | —                           |
| Retenciones      | 2         | ✅          | ✅       | —                           |
| Materiales Prod. | 3         | ✅          | ✅       | —                           |
| BOM              | 3         | ✅          | ✅       | —                           |
| Órd. Producción  | 6         | ✅          | ✅       | —                           |
| Planificación    | 2         | Placeholder | —        | Implementar UI              |
| Empleados        | 5         | ✅          | ✅       | —                           |
| Asistencias      | 2         | ✅          | ✅       | search en backend           |
| Horas            | 2         | ✅          | ✅       | search en backend           |
| Liquidaciones    | 4         | ✅          | ✅       | search en backend           |
| Vacaciones       | 4         | Placeholder | —        | Implementar UI              |
| Reportes         | 6         | ✅          | ✅       | —                           |

**Total endpoints backend:** 107+ | **Conexiones correctas:** ~95% | **Gaps críticos:** 2 (asientos confirmar/anular) + 12 search
