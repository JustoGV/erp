# 🚀 Sistema ERP - Guía Rápida

## Sistema completamente funcional sin base de datos

Este ERP es una **aplicación demo completa** que funciona sin necesidad de configurar ninguna base de datos. Todos los datos están hardcoded para demostración.

---

## ⚡ Instalación Rápida

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor
npm run dev

# 3. Abrir navegador
# http://localhost:3000
```

**¡Eso es todo! No necesitas configurar nada más.**

---

## 📂 Estructura del Proyecto

```
erp/
├── app/                      # Aplicación Next.js
│   ├── (dashboard)/         # Páginas con layout de dashboard
│   │   ├── dashboard/       # Dashboard principal con KPIs
│   │   ├── ventas/          # Módulo de ventas (clientes, facturas, etc.)
│   │   ├── compras/         # Módulo de compras (proveedores, OC, etc.)
│   │   ├── inventario/      # Control de stock y productos
│   │   ├── finanzas/        # Contabilidad, caja y bancos
│   │   ├── rrhh/            # Recursos humanos
│   │   ├── reportes/        # Reportes y análisis
│   │   └── configuracion/   # Configuración del sistema
│   ├── globals.css          # Estilos globales con Tailwind
│   ├── layout.tsx           # Layout principal de la app
│   └── page.tsx             # Página de inicio con módulos
├── components/              # Componentes reutilizables
│   ├── Header.tsx          # Barra superior con búsqueda
│   └── Sidebar.tsx         # Menú lateral de navegación
├── lib/
│   └── mock-data.ts        # TODOS LOS DATOS HARDCODED AQUÍ
├── public/                  # Archivos estáticos
├── package.json            # Dependencias del proyecto
├── tailwind.config.ts      # Configuración de Tailwind CSS
└── tsconfig.json           # Configuración de TypeScript
```

---

## 🎯 Módulos Implementados

### ✅ 1. Dashboard
- Vista general con estadísticas
- KPIs principales (ventas, compras, stock, clientes)
- Productos más vendidos
- Facturas recientes
- Alertas y notificaciones

### ✅ 2. Ventas
- **Clientes**: Lista y formulario de clientes
- **Presupuestos**: Gestión de presupuestos
- **Pedidos**: Control de pedidos
- **Facturas**: Emisión de facturas
- **Cobranzas**: Registro de pagos

### ✅ 3. Compras
- **Proveedores**: Base de proveedores
- **Órdenes de Compra**: Gestión de OC
- **Recepciones**: Ingreso de mercadería
- **Pagos**: Pagos a proveedores

### ✅ 4. Inventario
- **Productos**: Catálogo completo
- **Stock**: Control por depósito
- **Movimientos**: Entradas y salidas
- **Ajustes**: Ajustes de inventario

### ✅ 5. Finanzas
- **Plan de Cuentas**: Contabilidad
- **Asientos Contables**: Registros contables
- **Caja y Bancos**: Control de fondos
- **Cuentas por Cobrar/Pagar**: Gestión de deudas

### ✅ 6. RRHH
- **Empleados**: Base de empleados
- **Liquidaciones**: Sueldos mensuales
- **Asistencias**: Control de asistencia

### ✅ 7. Reportes
- Reportes de ventas
- Reportes de compras
- Reportes de inventario
- Reportes financieros
- Reportes de RRHH

### ✅ 8. Configuración
- Usuarios y roles
- Auditoría del sistema
- Configuración general

---

## 📊 Datos de Ejemplo

Todos los datos están en `lib/mock-data.ts`:

- **4 Clientes** de ejemplo
- **2 Proveedores** de ejemplo
- **4 Productos** con stock
- **4 Facturas** con diferentes estados
- **3 Empleados** con datos completos
- **2 Órdenes de compra**
- **Movimientos de stock**
- **Estadísticas y KPIs**
- **Alertas del sistema**

---

## 🎨 Características de UI

- ✅ **Diseño Responsive**: Funciona en móvil, tablet y desktop
- ✅ **Menú Lateral**: Navegación intuitiva entre módulos
- ✅ **Dark Mode Ready**: Preparado para tema oscuro
- ✅ **Tailwind CSS**: Estilos modernos y consistentes
- ✅ **Iconos Lucide**: Iconos elegantes y ligeros
- ✅ **Componentes Reutilizables**: Cards, badges, buttons, etc.

---

## 🔧 Personalización

### Modificar Datos

Edita el archivo `lib/mock-data.ts` para cambiar o agregar datos:

```typescript
// Agregar un nuevo cliente
export const mockClientes = [
  // ... clientes existentes
  {
    id: '5',
    code: 'CLI-005',
    name: 'Tu Nuevo Cliente',
    taxId: '20-99999999-9',
    email: 'nuevo@cliente.com',
    // ... más campos
  }
];
```

### Agregar Nuevos Módulos

1. Crea una carpeta en `app/(dashboard)/nuevo-modulo/`
2. Crea `page.tsx` con tu componente
3. Agrega el link en `components/Sidebar.tsx`
4. Usa datos de `lib/mock-data.ts`

---

## 💡 Uso del Sistema

### Navegación
- Usa el **menú lateral** para cambiar entre módulos
- Click en **"Dashboard"** para ver el resumen general
- El **header** tiene una barra de búsqueda (UI preparada)

### Formularios
- Los formularios funcionan en **modo demo**
- Al guardar, verás un **alert de confirmación**
- Los datos **NO se persisten** (es solo demostración)

### Listas y Tablas
- Todas las listas muestran **datos hardcoded**
- Los filtros están preparados a nivel de UI
- Los botones de editar/eliminar están conectados

---

## 🚀 Pasar a Producción

Si quieres convertir esto en un sistema real:

### 1. Agregar Base de Datos

```bash
npm install @prisma/client prisma
npx prisma init
```

### 2. Crear API Routes

Crea archivos en `app/api/[recurso]/route.ts`:

```typescript
// app/api/customers/route.ts
export async function GET() {
  // Conectar a BD y obtener clientes
}

export async function POST(request: Request) {
  // Guardar nuevo cliente en BD
}
```

### 3. Reemplazar Mock Data

```typescript
// En lugar de:
import { mockClientes } from '@/lib/mock-data';

// Usa:
const response = await fetch('/api/customers');
const clientes = await response.json();
```

### 4. Agregar Autenticación

```bash
npm install next-auth
```

---

## 📝 Notas Importantes

- ⚠️ **Sistema DEMO**: Todos los datos son hardcoded
- ⚠️ **Sin Persistencia**: Los formularios no guardan datos
- ⚠️ **Sin Autenticación**: No hay login ni seguridad
- ⚠️ **Sin Base de Datos**: No se conecta a ninguna BD
- ✅ **Perfecto para Demos**: Ideal para presentaciones y prototipos

---

## 🆘 Problemas Comunes

### Error: Module not found

```bash
# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

### Puerto 3000 ocupado

```bash
# Usar otro puerto
npm run dev -- -p 3001
```

### Errores de TypeScript

Los errores en el editor son normales antes de instalar. Después de `npm install` desaparecen.

---

## 📞 Soporte

Este es un proyecto de demostración. Para uso en producción:

1. Implementar base de datos
2. Agregar autenticación
3. Crear APIs reales
4. Agregar validaciones
5. Implementar tests

---

**¡Disfruta del sistema ERP! 🎉**

*Versión: 1.0.0 - Sistema Demo Hardcoded*
