# Sistema ERP Completo

Sistema de gestión empresarial (ERP) desarrollado con Next.js 14, TypeScript y Tailwind CSS (versión demo con datos hardcoded).

## 🚀 Características

### Módulos Implementados

1. **Ventas (Comercial)**
   - ✅ Gestión de clientes
   - ✅ Presupuestos
   - ✅ Pedidos
   - ✅ Facturas (incluye facturación electrónica)
   - ✅ Cobranzas

2. **Compras**
   - ✅ Gestión de proveedores
   - ✅ Órdenes de compra
   - ✅ Recepción de mercadería
   - ✅ Pagos a proveedores

3. **Stock / Inventario**
   - ✅ Productos
   - ✅ Control de stock por depósito
   - ✅ Movimientos de stock
   - ✅ Ajustes de inventario

4. **Finanzas / Contabilidad**
   - ✅ Plan de cuentas
   - ✅ Asientos contables automáticos
   - ✅ Caja y bancos
   - ✅ Reportes financieros

5. **Recursos Humanos**
   - ✅ Gestión de empleados
   - ✅ Liquidación de sueldos
   - ✅ Control de ausencias y horas

6. **Reportes**
   - ✅ Dashboard con KPIs
   - ✅ Reportes de ventas
   - ✅ Reportes de compras
   - ✅ Estado de caja
   - ✅ Deudas de clientes y proveedores

7. **Seguridad**
   - ✅ Gestión de usuarios
   - ✅ Roles y permisos
   - ✅ Auditoría de cambios

## 📋 Requisitos Previos

- Node.js 18 o superior
- npm o yarn

## 🛠️ Instalación

1. **Instalar dependencias**
```bash
npm install
```

2. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

3. **Abrir en el navegador**
```
http://localhost:3000
```

**¡Eso es todo!** No necesitas configurar base de datos ni variables de entorno. Todo funciona con datos hardcoded.

## 📚 Estructura del Proyecto

```
erp/
├── app/
│   ├── (dashboard)/         # Páginas del dashboard con layout
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── ventas/          # Módulo de ventas
│   │   ├── compras/         # Módulo de compras
│   │   ├── inventario/      # Módulo de inventario
│   │   ├── finanzas/        # Módulo de finanzas
│   │   ├── rrhh/            # Módulo de RRHH
│   │   ├── reportes/        # Módulo de reportes
│   │   └── configuracion/   # Configuración y usuarios
│   ├── api/                 # API Routes
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página de inicio
├── components/              # Componentes reutilizables
│   ├── Header.tsx
│   └── Sidebar.tsx
├── lib/
│   └── prisma.ts           # Cliente de Prisma
├── prisma/
│   └── schema.prisma       # Esquema de base de datos
├── public/                 # Archivos estáticos
├── .env.example            # Ejemplo de variables de entorno
├── next.config.js          # Configuración de Next.js
├── package.json            # Dependencias
├── tailwind.config.ts      # Configuración de Tailwind
└── tsconfig.json           # Configuración de TypeScript
```

## � Datos Mock

El sistema utiliza datos hardcoded definidos en `lib/mock-data.ts`:

- **Ventas**: Clientes, Presupuestos, Pedidos, Facturas, Pagos
- **Compras**: Proveedores, Órdenes de Compra, Recepciones, Pagos
- **Inventario**: Productos, Depósitos, Stock, Movimientos
- **Finanzas**: Cuentas, Asientos, Caja, Bancos
- **RRHH**: Empleados, Liquidaciones, Asistencias
- **Estadísticas**: KPIs y métricas del negocio

## 🎨 Tecnologías Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **Datos**: Mock data hardcoded (sin base de datos)

## 📖 Uso

### Módulo de Ventas

1. **Crear cliente**: Ir a Ventas > Clientes > Nuevo Cliente
2. **Crear presupuesto**: Ventas > Presupuestos > Nuevo Presupuesto
3. **Convertir a pedido**: Desde el presupuesto aprobado
4. **Facturar**: Ventas > Facturas > Nueva Factura
5. **Registrar cobro**: Ventas > Cobranzas > Nueva Cobranza

### Módulo de Compras

1. **Crear proveedor**: Compras > Proveedores > Nuevo Proveedor
2. **Crear orden de compra**: Compras > Órdenes > Nueva Orden
3. **Recibir mercadería**: Compras > Recepciones > Nueva Recepción
4. **Registrar pago**: Compras > Pagos > Nuevo Pago

### Módulo de Inventario

1. **Crear producto**: Inventario > Productos > Nuevo Producto
2. **Ver stock**: Inventario > Stock
3. **Ajustar stock**: Inventario > Movimientos > Ajuste

## 🚧 Desarrollo

### Comandos disponibles

```bash
# Desarrollo
npm run dev

# Build de producción
npm run build

# Iniciar producción
npm start
```

### Agregar nuevas funcionalidades

1. Agregar datos mock en `lib/mock-data.ts`
2. Crear páginas en `app/(dashboard)/[modulo]`
3. Crear componentes reutilizables en `components/`
4. Importar y usar datos mock en tus componentes

## 📝 Licencia

Este proyecto es privado y propietario.

## 👥 Equipo

Desarrollado para gestión empresarial integral.

## 🆘 Soporte

Para reportar problemas o sugerir mejoras, crear un issue en el repositorio.
# erp

## 🧩 Prompt para crear backend en NestJS

Copiá y pegá este prompt en Copilot para generar un backend completo desde cero:

```
Necesito que crees un backend completo desde cero (sin carpetas previas) para un ERP, usando NestJS + TypeScript + PostgreSQL con Prisma.

Requisitos obligatorios:
- Estructura modular por dominio: ventas, compras, inventario, producción, finanzas, rrhh, configuración, auditoría.
- CRUD completo para cada entidad (GET list, GET by id, POST, PUT, DELETE).
- DTOs con validación (class-validator) y pipes globales.
- Manejo de errores centralizado y respuestas JSON uniformes.
- Autenticación JWT (login, refresh opcional) y middleware/guards para proteger rutas.
- Seed de datos demo con Prisma.
- Documentación básica en README con pasos de instalación, migraciones, seed y ejecución.
- Variables de entorno (DATABASE_URL, JWT_SECRET) con .env.example.

Entidades mínimas y rutas:
1) Ventas
   - Clientes
   - Presupuestos
   - Pedidos
   - Seguimiento
   - Facturas
   - Cobranzas

2) Compras
   - Proveedores
   - Requerimientos
   - Órdenes de compra
   - Recepciones
   - Pagos

3) Inventario
   - Productos
   - Stock
   - Depósitos
   - Ajustes
   - Alertas
   - Valorización

4) Producción
   - Órdenes de producción
   - Máquinas
   - Planificación

5) Finanzas
   - Caja/Bancos
   - Cheques
   - Retenciones
   - Proyecciones
   - Rankings

6) RRHH
   - Empleados
   - Asistencias
   - Horas extra
   - Vacaciones
   - Liquidaciones

7) Configuración
   - Empresas
   - Usuarios
   - Roles
   - Permisos
   - Locales/Sucursales

8) Auditoría
   - Logs de acciones

Estados y filtros:
- Agregar campos de estado para entidades con flujo (pedido: borrador/en preparación/entregado; factura: pendiente/pagada; orden compra: abierta/cerrada, etc.).
- Incluir filtros por fecha, estado, empresa y local en los endpoints de listado.

Métodos/Endpoints requeridos (mínimos) para cada entidad:
- GET /[modulo]/[entidad] (listado con filtros + paginación)
- GET /[modulo]/[entidad]/{id} (detalle)
- POST /[modulo]/[entidad] (crear)
- PUT /[modulo]/[entidad]/{id} (editar completo)
- PATCH /[modulo]/[entidad]/{id}/estado (cambio de estado)
- DELETE /[modulo]/[entidad]/{id} (eliminar)

Endpoints transversales:
- POST /auth/login
- POST /auth/register (opcional)
- POST /auth/refresh (opcional)
- GET /auditoria/logs (listado con filtros)
- GET /configuracion/usuarios, /roles, /permisos
- GET /configuracion/empresas, /locales

Entregables:
- Crear estructura completa de carpetas, módulos, controladores, servicios, entidades Prisma, DTOs y rutas.
- Implementar todos los endpoints (sin placeholders).
- Proyecto listo para ejecutar con scripts npm/yarn.
```
