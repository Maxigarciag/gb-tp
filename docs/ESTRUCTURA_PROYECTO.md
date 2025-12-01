# Estructura y Funcionamiento del Proyecto GetBig

## 📁 Distribución de Carpetas

Este documento explica la organización final del proyecto después de la reestructuración, describiendo qué contiene cada carpeta y cómo funciona.

---

## 🗂️ Estructura General

```
src/
├── assets/              # Recursos estáticos
├── components/          # Componentes React organizados por dominio
├── contexts/            # Contextos de React (estado global)
├── hooks/               # Hooks personalizados
├── lib/                 # Configuraciones de librerías externas
├── pages/               # Páginas/vistas de nivel superior
├── services/            # Servicios y lógica de negocio (futuro)
├── stores/              # Stores de Zustand (estado global)
├── styles/              # Estilos CSS organizados por módulo
├── utils/               # Utilidades y funciones helper
├── constants/           # Constantes de la aplicación
├── data/                # Datos estáticos y configuraciones
├── App.jsx              # Componente raíz de la aplicación
└── main.jsx             # Punto de entrada de la aplicación
```

---

## 📂 Descripción Detallada de Cada Carpeta

### 1. `assets/` - Recursos Estáticos

**Propósito**: Almacena recursos estáticos como imágenes, iconos, fuentes, etc.

**Estructura**:
```
assets/
└── images/              # Imágenes del proyecto
    ├── GB-LOGOAZULCLARO.png
    ├── GB-LOGOBLANCO.png
    └── GB-LOGONEGRO.png
```

**Funcionamiento**:
- Las imágenes se importan directamente en los componentes
- Se usan para logos, iconos de la aplicación
- Vite procesa estas imágenes automáticamente en el build

**Ejemplo de uso**:
```jsx
import logoBlanco from '../../assets/images/GB-LOGOBLANCO.png'
```

---

### 2. `components/` - Componentes React

**Propósito**: Contiene todos los componentes React organizados por dominio funcional.

**Estructura**:
```
components/
├── auth/                # Componentes de autenticación
│   ├── AuthPage.jsx
│   ├── LoginForm.jsx
│   └── RegisterForm.jsx
│
├── common/              # Componentes reutilizables genéricos
│   ├── ButtonOptimized.jsx
│   ├── ConfirmDialogOptimized.jsx
│   ├── ErrorBoundaryOptimized.jsx
│   ├── LazyComponent.jsx
│   ├── LoadingSpinnerOptimized.jsx
│   ├── NotificationSystemOptimized.jsx
│   └── ToastOptimized.jsx
│
├── home/                # Componentes específicos de la página home
│   ├── HomeDashboardOptimized.jsx
│   ├── LandingHero.jsx
│   ├── MotivationCard.jsx
│   ├── ResumenStats.jsx
│   └── WeeklyCalendar.jsx
│
├── layout/              # Componentes de estructura/layout
│   ├── AuthOnly.jsx          # HOC para proteger rutas
│   ├── FooterOptimized.jsx
│   ├── Layout.jsx
│   ├── NavbarOptimized.jsx
│   └── ProtectedRoute.jsx
│
├── navigation/          # Componentes de navegación
│   └── HeaderTabs.jsx
│
├── progreso/            # Componentes de la sección de progreso
│   ├── BaseProgressCard.jsx
│   ├── BodyCompositionStudies.jsx
│   ├── BodyFatCalculator.jsx
│   ├── ComposicionCorporalCard.jsx
│   ├── Evolution.jsx
│   ├── MacroCalculator/
│   ├── ProfessionalWorkoutTracker.jsx
│   ├── ProgressDashboard.jsx
│   └── ... (más componentes)
│
├── rutinas/             # Componentes de rutinas de entrenamiento
│   ├── CalendarioRutina.jsx
│   ├── CustomRoutineBuilder.jsx
│   ├── FormularioOptimized.jsx
│   ├── RoutineSelector.jsx
│   └── RutinaGlobalOptimized.jsx
│
├── pwa/                 # Componentes relacionados con PWA
│   ├── PWAInstallBanner.jsx
│   └── PWAStatusIndicator.jsx
│
├── theme/               # Componentes relacionados con temas
│   └── ThemeToggleOptimized.jsx
│
└── usuario/             # Componentes relacionados con perfil de usuario
    ├── UserProfileOptimized.jsx
    └── LogoutConfirmDialog.jsx
```

**Funcionamiento**:
- Cada subcarpeta agrupa componentes relacionados por funcionalidad
- Los componentes en `common/` son reutilizables en toda la app
- Los componentes en carpetas específicas (como `progreso/`, `rutinas/`) son específicos de esas secciones
- Los componentes se importan usando rutas relativas desde las páginas

**Principios de organización**:
- **Por dominio**: Componentes relacionados están juntos
- **Reutilización**: Componentes genéricos en `common/`
- **Especificidad**: Componentes específicos en sus carpetas correspondientes

---

### 3. `contexts/` - Contextos de React

**Propósito**: Maneja el estado global de la aplicación usando React Context API.

**Estructura**:
```
contexts/
├── AuthContext.jsx          # Estado de autenticación y usuario
├── LogoutContext.jsx        # Manejo de logout y confirmación
├── ThemeContext.jsx         # Estado del tema (claro/oscuro)
└── ToastContext.jsx         # Sistema de notificaciones toast
```

**Funcionamiento**:
- Cada contexto provee estado y funciones relacionadas
- Se usan con hooks personalizados (ej: `useAuth()`, `useTheme()`)
- Se envuelven en `App.jsx` para estar disponibles en toda la app

**Ejemplo de uso**:
```jsx
import { useAuth } from '../contexts/AuthContext'

function MyComponent() {
  const { user, userProfile } = useAuth()
  // ...
}
```

---

### 4. `hooks/` - Hooks Personalizados

**Propósito**: Contiene hooks personalizados de React que encapsulan lógica reutilizable.

**Estructura**:
```
hooks/
├── useEjerciciosAgrupados.js      # Agrupa ejercicios por grupo muscular
├── useEjerciciosDelDiaDB.js       # Obtiene ejercicios de un día específico
├── useProfessionalTracking.js     # Lógica de tracking profesional
├── useProgressCards.js            # Gestión de estado de cards de progreso
├── usePWA.js                      # Funcionalidad de PWA
├── useSessionOptimization.js      # Optimización de sesión
├── useWeeklyCalendar.js           # Lógica del calendario semanal
└── useWeeklyProgress.js           # Progreso semanal
```

**Funcionamiento**:
- Los hooks encapsulan lógica compleja y la hacen reutilizable
- Siguen la convención de nombres `use*`
- Pueden usar otros hooks de React y hooks personalizados
- Se importan en componentes que necesitan esa lógica

**Ejemplo de uso**:
```jsx
import { useProgressCards } from '../hooks/useProgressCards'

function ProgresoPage() {
  const { activeTab, expandedCard } = useProgressCards(...)
  // ...
}
```

---

### 5. `lib/` - Configuraciones de Librerías

**Propósito**: Contiene configuraciones y clientes de librerías externas.

**Estructura**:
```
lib/
└── supabase.js           # Cliente de Supabase y funciones de base de datos
```

**Funcionamiento**:
- Configura el cliente de Supabase
- Exporta funciones para interactuar con la base de datos
- Centraliza la configuración de servicios externos

**Ejemplo de uso**:
```jsx
import { supabase, userProfiles } from '../lib/supabase'
```

---

### 6. `pages/` - Páginas/Vistas

**Propósito**: Contiene las páginas principales de la aplicación que se usan en el router.

**Estructura**:
```
pages/
├── about.jsx                    # Página "Acerca de"
├── contact.jsx                  # Página de contacto
├── ejercicios-personalizados.jsx  # Gestión de ejercicios personalizados
├── home.jsx                     # Página principal/landing
├── profile.jsx                  # Página de perfil de usuario
├── progreso.jsx                 # Página principal de progreso
├── progreso/                    # Subpáginas de progreso
│   ├── ComposicionPage.jsx
│   ├── GraficosEjerciciosPage.jsx
│   ├── GraficosPage.jsx
│   ├── HistorialPage.jsx
│   ├── RegistrarPage.jsx
│   └── RutinaHoyPage.jsx
└── rutinas.jsx                  # Gestión de rutinas
```

**Funcionamiento**:
- Cada página es un componente de nivel superior
- Se mapean a rutas en `App.jsx` usando React Router
- Orquestan componentes más pequeños para crear la vista completa
- Pueden tener lógica de estado y efectos específicos de la página

**Ejemplo de uso en routing**:
```jsx
// En App.jsx
const LazyProgreso = lazy(() => import("./pages/progreso.jsx"));

<Route path="/progreso" element={<LazyProgreso />} />
```

---

### 7. `stores/` - Stores de Zustand

**Propósito**: Maneja estado global usando Zustand (alternativa a Redux más simple).

**Estructura**:
```
stores/
├── exerciseStore.js      # Estado de ejercicios
├── index.js              # Exportaciones centralizadas
├── routineStore.js       # Estado de rutinas
├── uiStore.js            # Estado de UI (tema, notificaciones, etc.)
└── userStore.js          # Estado del usuario/perfil
```

**Funcionamiento**:
- Cada store maneja un dominio específico del estado
- Se accede usando hooks (ej: `useUIStore()`, `useRoutineStore()`)
- Permite compartir estado entre componentes sin prop drilling
- Más ligero que Redux pero con funcionalidad similar

**Ejemplo de uso**:
```jsx
import { useUIStore } from '../stores'

function MyComponent() {
  const { theme, setTheme } = useUIStore()
  // ...
}
```

---

### 8. `styles/` - Estilos CSS

**Propósito**: Contiene todos los archivos CSS organizados por módulo.

**Estructura**:
```
styles/
├── common/               # Estilos globales y compartidos
│   ├── Global.css        # Estilos globales de la aplicación
│   ├── Variables.css     # Variables CSS (colores, tamaños, etc.)
│   ├── ThemeContrast.css # Estilos de contraste para temas
│   └── PWAVariables.css  # Variables específicas de PWA
│
├── components/           # Estilos por componente, organizados por dominio
│   ├── auth/
│   │   └── Auth.css
│   ├── common/
│   │   ├── Button.css
│   │   ├── ConfirmDialog.css
│   │   ├── LoadingSpinner.css
│   │   ├── NotificationSystem.css
│   │   └── Toast.css
│   ├── home/
│   │   ├── Home.css
│   │   ├── HomeDashboard.css
│   │   └── WeeklyCalendar.css
│   ├── layout/
│   │   ├── Footer.css
│   │   ├── Layout.css
│   │   └── Navbar.css
│   ├── navigation/
│   │   └── HeaderTabs.css
│   ├── progreso/
│   │   ├── BodyCompositionStudies.css
│   │   ├── BodyFatCalculator.css
│   │   ├── Evolution.css
│   │   └── ... (más estilos)
│   ├── rutinas/
│   │   ├── CalendarioRutina.css
│   │   ├── CustomRoutineBuilder.css
│   │   └── ... (más estilos)
│   ├── pwa/
│   │   ├── PWAInstallBanner.css
│   │   └── PWAStatusIndicator.css
│   ├── theme/
│   │   └── ThemeToggle.css
│   └── usuario/
│       ├── Profile.css
│       └── UserProfile.css
│
└── pages/                # Estilos específicos de páginas
    └── about.css
```

**Funcionamiento**:
- `common/` contiene estilos compartidos y variables globales
- `components/` organiza estilos por dominio funcional
- `pages/` contiene estilos específicos de páginas
- Los estilos se importan en los componentes correspondientes
- Vite procesa y optimiza los CSS en el build

**Ejemplo de uso**:
```jsx
import '../../styles/components/progreso/Evolution.css'
```

---

### 9. `utils/` - Utilidades

**Propósito**: Contiene funciones helper y utilidades reutilizables.

**Estructura**:
```
utils/
├── cacheUtils.js         # Utilidades de caché
├── exportStudy.js        # Exportación de estudios
├── macroCalculations.js  # Cálculos de macros
├── validaciones.js       # Funciones de validación
└── debug/                # Utilidades de debug (solo desarrollo)
    ├── debug.js
    ├── debugProfile.js
    └── debugRoutines.js
```

**Funcionamiento**:
- Funciones puras sin dependencias de React
- Se pueden usar en cualquier parte de la aplicación
- Las utilidades de debug solo se cargan en desarrollo
- No contienen lógica de negocio compleja (esa va en `services/`)

**Ejemplo de uso**:
```jsx
import { validarDatos } from '../utils/validaciones'
```

---

### 10. `constants/` - Constantes

**Propósito**: Define constantes centralizadas de la aplicación.

**Estructura**:
```
constants/
└── index.js              # Todas las constantes exportadas
```

**Funcionamiento**:
- Evita "magic numbers" y strings hardcodeados
- Facilita el mantenimiento
- Incluye constantes como:
  - Límites de series y repeticiones
  - Niveles de RPE
  - Rangos de validación
  - Mensajes de error/éxito
  - Breakpoints responsive
  - etc.

**Ejemplo de uso**:
```jsx
import { RPE_LEVELS, VALIDATION_RANGES } from '../constants'
```

---

### 11. `data/` - Datos Estáticos

**Propósito**: Contiene datos estáticos y configuraciones que no cambian.

**Estructura**:
```
data/
├── rutinasPredefinidas.js  # Rutinas de entrenamiento predefinidas
└── seedExercises.js        # Datos de seed para ejercicios
```

**Funcionamiento**:
- Datos que no provienen de la base de datos
- Configuraciones estáticas
- Se importan cuando se necesitan
- No contienen lógica, solo datos

**Ejemplo de uso**:
```jsx
import { rutinas, obtenerRutinaRecomendada } from '../data/rutinasPredefinidas'
```

---

### 12. `services/` - Servicios (Futuro)

**Propósito**: Contendrá servicios y lógica de negocio separada de los componentes.

**Estado actual**: Carpeta no creada aún, pero está en la propuesta de reestructuración.

**Funcionamiento previsto**:
- Extraer lógica de negocio de `lib/supabase.js`
- Crear servicios como:
  - `auth.service.js`
  - `ejercicios.service.js`
  - `progreso.service.js`
  - `rutinas.service.js`

---

## 🔄 Flujo de Datos y Comunicación

### 1. **Estado Global**
```
Contexts (React Context) ←→ Components
Stores (Zustand) ←→ Components
```

### 2. **Datos de Base de Datos**
```
Components → lib/supabase.js → Supabase API
```

### 3. **Routing**
```
App.jsx → pages/ → components/
```

### 4. **Estilos**
```
Components → styles/components/[domain]/[Component].css
Pages → styles/pages/[Page].css
Global → styles/common/Global.css
```

---

## 📋 Convenciones y Buenas Prácticas

### Nombres de Archivos
- **Componentes**: PascalCase (ej: `UserProfileOptimized.jsx`)
- **Hooks**: camelCase con prefijo `use` (ej: `useProgressCards.js`)
- **Utilidades**: camelCase (ej: `cacheUtils.js`)
- **Constantes**: UPPER_SNAKE_CASE en el contenido, archivos en camelCase

### Organización de Imports
```jsx
// 1. Imports de React
import React, { useState } from 'react'

// 2. Imports de librerías externas
import { motion } from 'framer-motion'

// 3. Imports internos - Contextos
import { useAuth } from '../contexts/AuthContext'

// 4. Imports internos - Hooks
import { useProgressCards } from '../hooks/useProgressCards'

// 5. Imports internos - Componentes
import ButtonOptimized from './common/ButtonOptimized'

// 6. Imports internos - Utils/Constants
import { validarDatos } from '../utils/validaciones'

// 7. Imports de estilos
import '../styles/components/progreso/Evolution.css'
```

### Estructura de Componentes
```jsx
// 1. Imports
// 2. PropTypes (si se usan)
// 3. Componente principal
// 4. Export default
```

---

## 🎯 Principios de Organización

### 1. **Separación por Dominio**
Cada funcionalidad tiene sus componentes, estilos y lógica agrupados.

### 2. **Reutilización**
Componentes genéricos en `common/`, hooks reutilizables en `hooks/`.

### 3. **Escalabilidad**
Estructura preparada para crecer sin desorganizarse.

### 4. **Mantenibilidad**
Fácil encontrar código relacionado, fácil hacer cambios.

### 5. **Claridad**
Nombres descriptivos, organización intuitiva.

---

## 🔍 Cómo Encontrar Código

### Buscar un componente
- **Componente genérico**: `components/common/`
- **Componente de progreso**: `components/progreso/`
- **Componente de rutinas**: `components/rutinas/`

### Buscar lógica de negocio
- **Hooks personalizados**: `hooks/`
- **Utilidades**: `utils/`
- **Servicios**: `lib/` (futuro: `services/`)

### Buscar estilos
- **Estilos globales**: `styles/common/`
- **Estilos de componente**: `styles/components/[domain]/`
- **Estilos de página**: `styles/pages/`

### Buscar datos
- **Constantes**: `constants/`
- **Datos estáticos**: `data/`

---

## 📝 Notas Importantes

1. **Lazy Loading**: Las páginas se cargan con `lazy()` para optimizar el bundle
2. **Code Splitting**: Vite divide automáticamente el código en chunks
3. **CSS Modules**: Los estilos están organizados pero no son CSS Modules (son imports normales)
4. **TypeScript**: El proyecto actualmente usa JavaScript, pero la estructura es compatible con TypeScript

---

## ✅ Resumen

Esta estructura sigue buenas prácticas de desarrollo React/Vite:

- ✅ **Organización clara** por dominio funcional
- ✅ **Separación de responsabilidades** (componentes, lógica, estilos, datos)
- ✅ **Escalabilidad** para crecer sin problemas
- ✅ **Mantenibilidad** fácil de navegar y modificar
- ✅ **Convenciones estándar** fáciles de seguir

La estructura está lista para desarrollo, testing y producción. 🚀

