# 🚀 Instrucciones de Instalación - ERP System

## Sistema ERP completo sin base de datos (Modo Demo/Hardcoded)

Este sistema ERP es una versión demo completamente funcional que **NO requiere base de datos**. Todos los datos están hardcoded para demostración.

---

## 📋 Requisitos Previos

- **Node.js** 18 o superior
- **npm** o **yarn**

---

## 🛠️ Pasos de Instalación

### 1. Instalar dependencias

```bash
npm install
```

O si usas yarn:

```bash
yarn install
```

### 2. Iniciar el servidor de desarrollo

```bash
npm run dev
```

O con yarn:

```bash
yarn dev
```

### 3. Abrir en el navegador

Abre tu navegador y ve a:

```
http://localhost:3000
```

---

## 🎯 ¡Listo! Ya puedes usar el sistema

No necesitas configurar ninguna base de datos, crear archivos `.env`, ni ejecutar migraciones. Todo funciona con datos hardcoded.

---

## 📂 Estructura del Proyecto

```
erp/
├── app/                      # Aplicación Next.js
│   ├── (dashboard)/         # Páginas del dashboard
│   │   ├── dashboard/       # Dashboard principal
│   │   ├── ventas/          # Módulo de ventas
│   │   ├── compras/         # Módulo de compras
│   │   ├── inventario/      # Módulo de inventario
│   │   ├── finanzas/        # Módulo de finanzas
│   │   ├── rrhh/            # Módulo de RRHH
│   │   ├── reportes/        # Módulo de reportes
│   │   └── configuracion/   # Configuración
│   ├── globals.css          # Estilos globales
│   ├── layout.tsx           # Layout principal
│   └── page.tsx             # Página de inicio
├── components/              # Componentes reutilizables
│   ├── Header.tsx          # Header del dashboard
│   └── Sidebar.tsx         # Sidebar de navegación
├── lib/
│   └── mock-data.ts        # Todos los datos hardcoded
├── public/                  # Archivos estáticos
├── next.config.js          # Configuración de Next.js
├── package.json            # Dependencias
├── tailwind.config.ts      # Configuración de Tailwind
└── tsconfig.json           # Configuración de TypeScript
```

---

## 🎨 Características

### ✅ Módulos Implementados

1. **Dashboard** - Vista general con KPIs y estadísticas
2. **Ventas** - Clientes, presupuestos, pedidos, facturas
3. **Compras** - Proveedores, órdenes de compra, pagos
4. **Inventario** - Productos, stock, movimientos
5. **Finanzas** - Contabilidad, caja, bancos
6. **RRHH** - Empleados, liquidaciones, asistencias
7. **Reportes** - Análisis y reportes completos
8. **Configuración** - Usuarios, roles, permisos

### 🔥 Todo funciona sin base de datos

- ✅ Navegación completa entre módulos
- ✅ Visualización de datos hardcoded
- ✅ Formularios funcionales (modo demo)
- ✅ Diseño responsive
- ✅ UI moderna con Tailwind CSS

---

## 📊 Datos de Ejemplo

Los datos están en el archivo `lib/mock-data.ts` e incluyen:

- 4 Clientes de ejemplo
- 2 Proveedores
- 4 Productos
- 4 Facturas
- 3 Empleados
- 2 Órdenes de compra
- Movimientos de stock
- Estadísticas generales

---

## 🎯 Uso del Sistema

### Navegación

Usa el menú lateral para navegar entre los diferentes módulos:

- **Dashboard** - Ver resumen general
- **Ventas** - Gestionar clientes y ventas
- **Compras** - Gestionar proveedores y compras
- **Inventario** - Control de productos y stock
- **Finanzas** - Contabilidad y finanzas
- **RRHH** - Gestión de personal
- **Reportes** - Análisis y reportes
- **Configuración** - Configuración del sistema

### Funcionalidades

- **Visualización de datos**: Todas las listas muestran datos hardcoded
- **Formularios**: Los formularios funcionan en modo demo (no persisten datos)
- **Búsqueda y filtros**: UI preparada para búsqueda (sin backend)
- **Reportes**: Visualización de estadísticas y gráficos

---

## 🚀 Próximos Pasos (Para Producción)

Si quieres convertir esto en un sistema real con base de datos:

1. **Instalar Prisma**:
   ```bash
   npm install @prisma/client prisma
   ```

2. **Configurar base de datos** (usa el schema en `prisma/schema.prisma` que ya está creado)

3. **Crear APIs** en `app/api/` para cada módulo

4. **Reemplazar mock-data** con llamadas a API usando `fetch`

5. **Agregar autenticación** con NextAuth.js

---

## 🎨 Tecnologías Utilizadas

- **Next.js 14** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **React Hooks** - Gestión de estado

---

## 📝 Notas Importantes

- ⚠️ Este es un sistema **DEMO** con datos hardcoded
- ⚠️ Los formularios **NO persisten** datos (solo simulan guardado)
- ⚠️ No hay autenticación ni seguridad implementada
- ⚠️ No se conecta a ninguna base de datos
- ✅ Perfecto para **demos, presentaciones y prototipos**

---

## 🆘 Soporte

Si tienes problemas con la instalación:

1. Verifica que tengas Node.js 18+
2. Borra `node_modules` y ejecuta `npm install` de nuevo
3. Verifica que el puerto 3000 esté disponible

---

## 📄 Licencia

Sistema ERP de demostración - Sin licencia específica

---

**¡Disfruta explorando el sistema ERP! 🎉**
