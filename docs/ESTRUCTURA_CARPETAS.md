# Estructura de Carpetas de la Aplicación GetBig

Este documento describe la organización completa de carpetas y archivos del proyecto, explicando el propósito y contenido de cada directorio.

## 📁 Estructura General

```
gb-tp/
├── api/                    # Endpoints de API serverless
├── docs/                   # Documentación del proyecto
├── public/                 # Archivos estáticos públicos
├── src/                    # Código fuente principal
├── supabase/               # Migraciones y configuración de base de datos
├── index.html              # Punto de entrada HTML
├── package.json            # Dependencias y scripts
├── vite.config.js          # Configuración de Vite
└── vercel.json             # Configuración de despliegue
```

---

## 📂 Carpetas Principales

### `/api` - Endpoints de API Serverless
**Propósito**: Contiene funciones serverless que se ejecutan en el backend (Vercel Functions, Supabase Edge Functions, etc.)

- `delete-user.js`: Endpoint para eliminar cuentas de usuario de forma segura desde el backend

---

### `/docs` - Documentación
**Propósito**: Almacena toda la documentación técnica, propuestas de mejoras, y resúmenes de cambios del proyecto.

**Contenido**:
- Documentos de optimización (navegación, progreso, rutinas)
- Documentos de implementación (PWA, calculadora de macros, etc.)
- Resúmenes de cambios diarios (formato: `YYYY-MM-DD-DESCRIPCION.md`)
- Propuestas de reestructuración y mejoras

---

### `/public` - Archivos Estáticos Públicos
**Propósito**: Archivos que se sirven directamente sin procesamiento, accesibles desde la raíz de la aplicación.

**Contenido**:
- `icon-*.png`: Iconos de la aplicación en diferentes tamaños (180px, 192px, 512px)
- `icono-blanco.ico`: Favicon
- `manifest.json`: Configuración del Progressive Web App (PWA)
- `sw.js`: Service Worker para funcionalidad offline y caché

---

### `/src` - Código Fuente Principal
**Propósito**: Contiene todo el código fuente de la aplicación React.

#### `/src/assets` - Recursos Estáticos
- `images/`: Logos de la marca en diferentes variantes (azul claro, blanco, negro)

#### `/src/components` - Componentes React
**Organización**: Los componentes están agrupados por funcionalidad o dominio.

**Subcarpetas**:

- **`auth/`**: Componentes de autenticación
  - `AuthPage.jsx`: Página principal de autenticación
  - `LoginForm.jsx`: Formulario de inicio de sesión
  - `RegisterForm.jsx`: Formulario de registro

- **`common/`**: Componentes reutilizables genéricos
  - `ButtonOptimized.jsx`: Botón optimizado con múltiples variantes
  - `ConfirmDialogOptimized.jsx`: Diálogo de confirmación
  - `ErrorBoundaryOptimized.jsx`: Manejo de errores de React
  - `LazyComponent.jsx`: Wrapper para carga diferida de componentes
  - `LoadingSpinnerOptimized.jsx`: Indicador de carga

- **`home/`**: Componentes del dashboard principal
  - `HomeDashboardOptimized.jsx`: Dashboard principal optimizado
  - `LandingHero.jsx`: Hero section de la landing page
  - `MotivationCard.jsx`: Tarjeta de motivación
  - `ResumenStats.jsx`: Resumen de estadísticas
  - `WeeklyCalendar.jsx`: Calendario semanal

- **`layout/`**: Componentes de estructura y layout
  - `AuthOnly.jsx`: Wrapper para contenido solo autenticado
  - `FooterOptimized.jsx`: Pie de página
  - `Layout.jsx`: Layout principal de la aplicación
  - `NavbarOptimized.jsx`: Barra de navegación
  - `ProtectedRoute.jsx`: Ruta protegida que requiere autenticación

- **`navigation/`**: Componentes de navegación
  - `HeaderTabs.jsx`: Pestañas de navegación en el header

- **`progreso/`**: Componentes relacionados con el seguimiento de progreso
  - `BaseProgressCard.jsx`: Tarjeta base de progreso
  - `BodyCompositionStudies.jsx`: Estudios de composición corporal
  - `BodyFatCalculator.jsx`: Calculadora de grasa corporal
  - `ComposicionCorporalCard.jsx`: Tarjeta de composición corporal
  - `Evolution.jsx`: Gráfico de evolución
  - `ExerciseLogCard.jsx`: Tarjeta de registro de ejercicios
  - `ExerciseProgressChart.jsx`: Gráfico de progreso de ejercicios
  - `MacroCalculator/`: Calculadora de macronutrientes (subcarpeta con múltiples componentes)
  - `MacroDistributionChart.jsx`: Gráfico de distribución de macros
  - `MobileProgressMenu.jsx`: Menú móvil de progreso
  - `ProfessionalExerciseCard.jsx`: Tarjeta profesional de ejercicio
  - `ProfessionalSessionHeader.jsx`: Header de sesión profesional
  - `ProfessionalWorkoutTracker.jsx`: Tracker profesional de entrenamiento
  - `ProgresoCorporalCard.jsx`: Tarjeta de progreso corporal
  - `ProgressDashboard.jsx`: Dashboard de progreso
  - `RutinaEjerciciosCard.jsx`: Tarjeta de ejercicios de rutina
  - `SessionFinishModal.jsx`: Modal de finalización de sesión
  - `StudyComparison.jsx`: Comparación de estudios
  - `StudyExportButton.jsx`: Botón de exportación de estudios
  - `UnifiedBodyChart.jsx`: Gráfico unificado del cuerpo

- **`pwa/`**: Componentes de Progressive Web App
  - `PWAInstallBanner.jsx`: Banner de instalación PWA
  - `PWAStatusIndicator.jsx`: Indicador de estado PWA

- **`rutinas/`**: Componentes de rutinas de entrenamiento
  - `CalendarioRutina.jsx`: Calendario de rutinas
  - `CustomRoutineBuilder.jsx`: Constructor de rutinas personalizadas
  - `EjercicioGrupo.jsx`: Grupo de ejercicios
  - `EjercicioItem.jsx`: Item individual de ejercicio
  - `FormularioOptimized.jsx`: Formulario optimizado
  - `InfoEjercicioCardOptimized.jsx`: Tarjeta de información de ejercicio
  - `ListaDias.jsx`: Lista de días de rutina
  - `RoutineSelector.jsx`: Selector de rutinas
  - `RutinaGlobalOptimized.jsx`: Vista global de rutina optimizada

- **`theme/`**: Componentes de tema
  - `ThemeToggleOptimized.jsx`: Toggle de tema claro/oscuro

- **`usuario/`**: Componentes de perfil de usuario
  - `LogoutConfirmDialog.jsx`: Diálogo de confirmación de cierre de sesión
  - `UserProfileOptimized.jsx`: Perfil de usuario optimizado

#### `/src/constants` - Constantes de la Aplicación
**Propósito**: Centraliza todas las constantes, valores mágicos y configuraciones reutilizables.

- `index.js`: Contiene constantes como:
  - Límites de series y repeticiones
  - Niveles de RPE (Rate of Perceived Exertion)
  - Rangos de validación de mediciones
  - Categorías de grasa corporal
  - Días de la semana
  - Estados de tracking
  - Tabs y navegación
  - Tiempos y delays
  - Límites y máximos
  - Patrones de validación
  - Mensajes de error y éxito
  - Configuración de animaciones
  - Breakpoints responsive
  - Z-index layers

#### `/src/contexts` - Contextos de React
**Propósito**: Maneja el estado global de la aplicación usando React Context API.

- `AuthContext.jsx`: Contexto de autenticación (usuario, sesión, login/logout)
- `LogoutContext.jsx`: Contexto para manejar el proceso de cierre de sesión
- `ThemeContext.jsx`: Contexto de tema (claro/oscuro)

#### `/src/data` - Datos Estáticos y Seed
**Propósito**: Contiene datos iniciales, seed data y datos predefinidos.

- `rutinasPredefinidas.js`: Rutinas de entrenamiento predefinidas
- `seedExercises.js`: Ejercicios base para poblar la base de datos

#### `/src/hooks` - Custom Hooks
**Propósito**: Hooks personalizados de React para lógica reutilizable.

- `useEjerciciosAgrupados.js`: Agrupa ejercicios por categoría
- `useEjerciciosDelDiaDB.js`: Obtiene ejercicios del día desde la base de datos
- `useIsMobile.js`: Detecta si el dispositivo es móvil
- `useProfessionalTracking.js`: Hook para tracking profesional de entrenamientos
- `useProgressCards.js`: Hook para tarjetas de progreso
- `usePWA.js`: Hook para funcionalidad PWA
- `useSessionOptimization.js`: Optimización de sesiones
- `useWeeklyCalendar.js`: Hook para calendario semanal
- `useWeeklyProgress.js`: Hook para progreso semanal

#### `/src/lib` - Librerías y Configuraciones
**Propósito**: Configuraciones de librerías externas y clientes de servicios.

- `supabase.js`: Cliente de Supabase con todas las funciones de:
  - Autenticación (signUp, signIn, signOut, etc.)
  - Perfiles de usuario
  - Ejercicios
  - Rutinas de entrenamiento
  - Sesiones de entrenamiento
  - Logs de ejercicios
  - Progreso del usuario
  - Estudios de composición corporal

#### `/src/pages` - Páginas de la Aplicación
**Propósito**: Componentes de página que representan rutas completas de la aplicación.

**Páginas principales**:
- `home.jsx`: Página de inicio
- `about.jsx`: Página sobre la aplicación
- `contact.jsx`: Página de contacto
- `profile.jsx`: Página de perfil de usuario
- `rutinas.jsx`: Página de gestión de rutinas
- `ejercicios-personalizados.jsx`: Página de ejercicios personalizados
- `progreso.jsx`: Página principal de progreso

**Subcarpeta `/progreso/`**:
- `ComposicionPage.jsx`: Página de composición corporal
- `GraficosEjerciciosPage.jsx`: Página de gráficos de ejercicios
- `GraficosPage.jsx`: Página de gráficos generales
- `HistorialPage.jsx`: Página de historial
- `RegistrarPage.jsx`: Página de registro de progreso
- `RutinaHoyPage.jsx`: Página de rutina del día

#### `/src/stores` - Estado Global (Zustand)
**Propósito**: Stores de Zustand para manejo de estado global de la aplicación.

- `index.js`: Exportaciones centralizadas de stores
- `exerciseStore.js`: Store de ejercicios
- `routineStore.js`: Store de rutinas
- `uiStore.js`: Store de estado de UI (tema, modales, etc.)
- `userStore.js`: Store de datos de usuario

#### `/src/styles` - Estilos CSS
**Propósito**: Todos los archivos CSS organizados por estructura de componentes.

**Organización**:
- `/common/`: Estilos globales y variables
  - `Global.css`: Estilos globales
  - `Variables.css`: Variables CSS (colores, tamaños, etc.)
  - `ThemeContrast.css`: Variables de contraste para temas
  - `PWAVariables.css`: Variables específicas de PWA

- `/components/`: Estilos específicos de componentes, organizados por carpeta de componente
  - `/auth/`: Estilos de autenticación
  - `/common/`: Estilos de componentes comunes
  - `/home/`: Estilos del dashboard
  - `/layout/`: Estilos de layout
  - `/navigation/`: Estilos de navegación
  - `/progreso/`: Estilos de progreso (16 archivos CSS)
  - `/pwa/`: Estilos de PWA
  - `/rutinas/`: Estilos de rutinas (7 archivos CSS)
  - `/theme/`: Estilos de tema
  - `/usuario/`: Estilos de usuario

- `/pages/`: Estilos específicos de páginas
  - `about.css`: Estilos de la página about

#### `/src/utils` - Utilidades
**Propósito**: Funciones auxiliares y utilidades reutilizables.

- `cacheUtils.js`: Utilidades de caché
- `macroCalculations.js`: Cálculos de macronutrientes
- `validaciones.js`: Funciones de validación
- `exportStudy.js`: Exportación de estudios

**Subcarpeta `/debug/`**:
- `debug.js`: Utilidades de debug generales
- `debugProfile.js`: Debug específico de perfiles
- `debugRoutines.js`: Debug específico de rutinas

#### Archivos Raíz de `/src`
- `App.jsx`: Componente raíz de la aplicación, maneja routing y estructura principal
- `main.jsx`: Punto de entrada de la aplicación React

---

### `/supabase` - Base de Datos
**Propósito**: Migraciones y scripts de base de datos.

- `/migrations/`: Archivos SQL de migración de base de datos
  - Migraciones para actualizar RPE opcional
  - Migraciones para agregar estudios corporales
  - Migraciones para agregar campos de nombre
  - Migraciones para insertar ejercicios faltantes
  - Migraciones para actualizar tipos de rutinas

---

## 🔄 Flujo de la Aplicación

1. **Entrada**: `index.html` → `main.jsx`
2. **Inicialización**: `App.jsx` configura routers, providers y rutas
3. **Autenticación**: `AuthContext` maneja el estado de usuario
4. **Navegación**: React Router maneja las rutas
5. **Componentes**: Se cargan de forma lazy para optimización
6. **Estado**: Zustand stores + React Context para estado global
7. **Datos**: Supabase client para todas las operaciones de base de datos
8. **Estilos**: CSS modular organizado por componente

---

## 📋 Convenciones de Nomenclatura

- **Componentes**: PascalCase (ej: `ButtonOptimized.jsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useIsMobile.js`)
- **Utilidades**: camelCase (ej: `cacheUtils.js`)
- **Estilos**: PascalCase (ej: `Button.css`)
- **Páginas**: camelCase (ej: `home.jsx`)
- **Stores**: camelCase con sufijo `Store` (ej: `userStore.js`)

---

## 🎯 Principios de Organización

1. **Separación por Dominio**: Componentes agrupados por funcionalidad (auth, progreso, rutinas)
2. **Reutilización**: Componentes comunes en `/common`
3. **Optimización**: Componentes optimizados con sufijo `Optimized`
4. **Lazy Loading**: Componentes pesados cargados de forma diferida
5. **CSS Modular**: Estilos organizados por componente, no inline
6. **Estado Centralizado**: Zustand para estado complejo, Context para estado simple
7. **Constantes Centralizadas**: Valores mágicos en `/constants`

---

## 🔧 Tecnologías Utilizadas

- **React 18**: Framework principal
- **React Router**: Navegación
- **Vite**: Build tool y dev server
- **Supabase**: Backend as a Service (BaaS)
- **Zustand**: Estado global
- **Tailwind CSS**: Framework CSS (según package.json)
- **Framer Motion**: Animaciones
- **Recharts**: Gráficos
- **React Hook Form + Zod**: Formularios y validación

---

Este documento se actualiza conforme la estructura del proyecto evoluciona.

