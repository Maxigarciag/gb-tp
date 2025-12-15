# Propuesta de Reestructuración del Proyecto GetBig

## 📋 Resumen Ejecutivo

Esta propuesta busca reorganizar completamente la estructura del proyecto para seguir buenas prácticas de desarrollo React/Vite, mejorar la mantenibilidad, y establecer una organización coherente y escalable.

---

## 🎯 Objetivos

1. **Eliminar duplicaciones**: Archivos duplicados que causan confusión
2. **Organizar por dominio**: Agrupar código relacionado por funcionalidad
3. **Consistencia de nombres**: Traducir al español donde sea apropiado y mantener consistencia
4. **Separación de responsabilidades**: Separar claramente componentes, hooks, servicios, utils, etc.
5. **Organización de estilos**: Agrupar CSS por módulos/componentes

---

## 📁 Estructura Propuesta Final

```
src/
├── assets/                    # Recursos estáticos (imágenes, iconos, etc.)
│   └── images/
│       ├── GB-LOGOAZULCLARO.png
│       ├── GB-LOGOBLANCO.png
│       └── GB-LOGONEGRO.png
│
├── components/                 # Componentes React organizados por dominio
│   ├── auth/                  # Componentes de autenticación
│   │   ├── AuthPage.jsx
│   │   ├── LoginForm.jsx
│   │   └── RegisterForm.jsx
│   │
│   ├── common/                # Componentes reutilizables genéricos
│   │   ├── ButtonOptimized.jsx
│   │   ├── ConfirmDialogOptimized.jsx
│   │   ├── ErrorBoundaryOptimized.jsx
│   │   ├── LazyComponent.jsx
│   │   ├── LoadingSpinnerOptimized.jsx
│   │   ├── NotificationSystemOptimized.jsx
│   │   └── ToastOptimized.jsx
│   │
│   ├── home/                  # Componentes específicos de la página home
│   │   ├── HomeDashboardOptimized.jsx
│   │   ├── LandingHero.jsx
│   │   ├── MotivationCard.jsx
│   │   ├── ResumenStats.jsx
│   │   └── WeeklyCalendar.jsx
│   │
│   ├── layout/                # Componentes de estructura/layout
│   │   ├── FooterOptimized.jsx
│   │   ├── Layout.jsx
│   │   ├── NavbarOptimized.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── AuthOnly.jsx       # (mantener solo este, eliminar duplicado)
│   │
│   ├── navigation/            # Componentes de navegación
│   │   └── HeaderTabs.jsx
│   │
│   ├── progreso/              # Componentes de la sección de progreso
│   │   ├── BaseProgressCard.jsx
│   │   ├── BodyCompositionStudies.jsx
│   │   ├── BodyFatCalculator.jsx
│   │   ├── CardLoadingFallback.jsx
│   │   ├── ComposicionCorporalCard.jsx
│   │   ├── Evolution.jsx
│   │   ├── ExerciseLogCard.jsx
│   │   ├── ExerciseProgressChart.jsx
│   │   ├── MacroCalculator/
│   │   │   ├── CalculatorForm.jsx
│   │   │   ├── GenderSelector.jsx
│   │   │   ├── InputField.jsx
│   │   │   ├── MacroCalculator.jsx
│   │   │   ├── ResultItem.jsx
│   │   │   ├── ResultsDisplay.jsx
│   │   │   └── SelectField.jsx
│   │   ├── MacroDistributionChart.jsx
│   │   ├── ProfessionalExerciseCard.jsx
│   │   ├── ProfessionalSessionHeader.jsx
│   │   ├── (eliminado) ProfessionalWorkoutTracker.jsx
│   │   ├── ProgresoCorporalCard.jsx
│   │   ├── ProgressDashboard.jsx
│   │   ├── (eliminado) RutinaEjerciciosCard.jsx
│   │   ├── SessionFinishModal.jsx
│   │   ├── StudyComparison.jsx
│   │   ├── StudyExportButton.jsx
│   │   └── UnifiedBodyChart.jsx
│   │
│   ├── rutinas/               # Componentes de rutinas de entrenamiento
│   │   ├── CalendarioRutina.jsx
│   │   ├── CustomRoutineBuilder.jsx
│   │   ├── EjercicioGrupo.jsx
│   │   ├── EjercicioItem.jsx
│   │   ├── InfoEjercicioCardOptimized.jsx
│   │   ├── ListaDias.jsx
│   │   ├── RoutineSelector.jsx
│   │   └── RutinaGlobalOptimized.jsx  # (mantener solo este, eliminar duplicado)
│   │
│   ├── pwa/                   # Componentes relacionados con PWA
│   │   ├── PWAInstallBanner.jsx
│   │   └── PWAStatusIndicator.jsx
│   │
│   ├── theme/                 # Componentes relacionados con temas
│   │   └── ThemeToggleOptimized.jsx
│   │
│   └── usuario/               # Componentes relacionados con perfil de usuario
│       ├── UserProfileOptimized.jsx
│       └── LogoutConfirmDialog.jsx
│
├── contexts/                   # Contextos de React
│   ├── AuthContext.jsx
│   ├── LogoutContext.jsx
│   ├── ThemeContext.jsx
│   └── ToastContext.jsx
│
├── hooks/                     # Hooks personalizados
│   ├── useEjerciciosAgrupados.js      # (mover desde utils/)
│   ├── useEjerciciosDelDiaDB.js       # (mover desde utils/)
│   ├── useProfessionalTracking.js
│   ├── useProgressCards.js
│   ├── usePWA.js
│   ├── useSessionOptimization.js     # (mover desde utils/)
│   └── useWeeklyCalendar.js
│   └── useWeeklyProgress.js
│
├── lib/                       # Librerías y configuraciones externas
│   └── supabase.js
│
├── pages/                     # Páginas principales de la aplicación
│   ├── about.jsx
│   ├── contact.jsx
│   ├── ejercicios-personalizados.jsx
│   ├── home.jsx
│   ├── profile.jsx
│   ├── progreso.jsx
│   ├── progreso/               # Subpáginas de progreso
│   │   ├── ComposicionPage.jsx
│   │   ├── GraficosEjerciciosPage.jsx
│   │   ├── GraficosPage.jsx
│   │   ├── HistorialPage.jsx
│   │   ├── RegistrarPage.jsx
│   │   └── RutinaHoyPage.jsx
│   └── rutinas.jsx
│
├── services/                  # Servicios y lógica de negocio
│   ├── auth.service.js        # (extraer de lib/supabase.js si es necesario)
│   ├── ejercicios.service.js  # (extraer de lib/supabase.js)
│   ├── progreso.service.js    # (extraer de lib/supabase.js)
│   └── rutinas.service.js     # (extraer de lib/supabase.js)
│
├── stores/                    # Stores de Zustand
│   ├── exerciseStore.js
│   ├── index.js
│   ├── routineStore.js
│   ├── uiStore.js
│   └── userStore.js
│
├── styles/                    # Estilos CSS organizados por módulo
│   ├── common/                # Estilos comunes y compartidos
│   │   ├── Global.css
│   │   ├── Variables.css
│   │   ├── ThemeContrast.css
│   │   └── PWAVariables.css
│   │
│   ├── components/            # Estilos por componente
│   │   ├── auth/
│   │   │   └── Auth.css
│   │   ├── common/
│   │   │   ├── Button.css
│   │   │   ├── ConfirmDialog.css
│   │   │   ├── LoadingSpinner.css
│   │   │   ├── NotificationSystem.css
│   │   │   └── Toast.css
│   │   ├── home/
│   │   │   ├── Home.css
│   │   │   ├── HomeDashboard.css
│   │   │   └── WeeklyCalendar.css
│   │   ├── layout/
│   │   │   ├── Footer.css
│   │   │   ├── Layout.css
│   │   │   └── Navbar.css
│   │   ├── navigation/
│   │   │   └── HeaderTabs.css
│   │   ├── progreso/
│   │   │   ├── BodyCompositionStudies.css
│   │   │   ├── BodyFatCalculator.css
│   │   │   ├── Evolution.css
│   │   │   ├── ExerciseLog.css
│   │   │   ├── MacroCalculator.css
│   │   │   ├── MacroDistributionChart.css
│   │   │   ├── ProfessionalTracking.css
│   │   │   ├── ProgresoCards.css
│   │   │   ├── ProgresoPage.css
│   │   │   ├── ProgressDashboard.css
│   │   │   ├── ProgressTabs.css
│   │   │   ├── StudyComparison.css
│   │   │   ├── StudyExportButton.css
│   │   │   └── UnifiedBodyChart.css
│   │   ├── rutinas/
│   │   │   ├── CalendarioRutina.css
│   │   │   ├── CustomExercisesManager.css
│   │   │   ├── CustomRoutineBuilder.css
│   │   │   ├── Formulario.css
│   │   │   ├── InfoEjercicioCard.css
│   │   │   ├── RoutineSelector.css
│   │   │   └── RoutinesManager.css
│   │   ├── pwa/
│   │   │   ├── PWAInstallBanner.css
│   │   │   └── PWAStatusIndicator.css
│   │   ├── theme/
│   │   │   ├── ThemeToggle.css
│   │   │   └── ThemeContrast.css (ya está en common)
│   │   └── usuario/
│   │       ├── Profile.css
│   │       └── UserProfile.css
│   │
│   └── pages/                 # Estilos de páginas
│       └── about.css
│
├── utils/                     # Utilidades y funciones helper
│   ├── cacheUtils.js
│   ├── exportStudy.js
│   ├── macroCalculations.js
│   ├── validaciones.js
│   └── debug/                 # Utilidades de debug (solo desarrollo)
│       ├── debug.js
│       ├── debugProfile.js
│       └── debugRoutines.js
│
├── constants/                 # Constantes de la aplicación
│   └── index.js
│
├── data/                      # Datos estáticos y configuraciones
│   ├── rutinasPredefinidas.js  # (renombrar desde utils/rutinas.js)
│   └── seedExercises.js        # (mover desde utils/)
│
├── App.jsx
└── main.jsx
```

---

## 📝 Lista Detallada de Cambios

### 1. ELIMINACIÓN DE ARCHIVOS DUPLICADOS

#### 1.1. AuthOnly.jsx
- **Eliminar**: `src/components/AuthOnly.jsx`
- **Mantener**: `src/components/layout/AuthOnly.jsx`
- **Razón**: El archivo en `layout/` es el que se está usando en todas las páginas. El duplicado en la raíz de `components/` no se usa.

#### 1.2. RutinaGlobalOptimized.jsx
- **Eliminar**: `src/components/RutinaGlobalOptimized.jsx`
- **Mantener**: `src/components/rutinas/RutinaGlobalOptimized.jsx`
- **Razón**: El archivo en `rutinas/` es el que se importa desde `CalendarioRutina.jsx`. El duplicado en la raíz no se usa.

---

### 2. REUBICACIÓN DE ARCHIVOS

#### 2.1. Hooks desde utils/ a hooks/
- **Mover**: `src/utils/useSessionOptimization.js` → `src/hooks/useSessionOptimization.js`
- **Mover**: `src/utils/useEjerciciosAgrupados.js` → `src/hooks/useEjerciciosAgrupados.js`
- **Mover**: `src/utils/useEjerciciosDelDiaDB.js` → `src/hooks/useEjerciciosDelDiaDB.js`
- **Razón**: Estos archivos son hooks de React (usan `use*` y hooks de React), no utilidades genéricas. Deben estar en la carpeta `hooks/`.

#### 2.2. Componentes sueltos a carpetas organizadas
- **Mover**: `src/components/FormularioOptimized.jsx` → `src/components/rutinas/FormularioOptimized.jsx`
  - **Razón**: Este componente está relacionado con la selección de rutinas, debe estar junto a los otros componentes de rutinas.
  
- **Mover**: `src/components/LogoutConfirmDialog.jsx` → `src/components/usuario/LogoutConfirmDialog.jsx`
  - **Razón**: Está relacionado con la gestión del usuario/perfil.
  
- **Mover**: `src/components/PWAInstallBanner.jsx` → `src/components/pwa/PWAInstallBanner.jsx`
- **Mover**: `src/components/PWAStatusIndicator.jsx` → `src/components/pwa/PWAStatusIndicator.jsx`
  - **Razón**: Componentes específicos de PWA deben estar agrupados.
  
- **Mover**: `src/components/ThemeToggleOptimized.jsx` → `src/components/theme/ThemeToggleOptimized.jsx`
  - **Razón**: Componente relacionado con temas debe estar en su propia carpeta.
  
- **Mover**: `src/components/UserProfileOptimized.jsx` → `src/components/usuario/UserProfileOptimized.jsx`
  - **Razón**: Componente de perfil de usuario debe estar en la carpeta de usuario.

#### 2.3. Datos estáticos desde utils/ a data/
- **Mover**: `src/utils/rutinas.js` → `src/data/rutinasPredefinidas.js`
  - **Renombrar**: `rutinas.js` → `rutinasPredefinidas.js`
  - **Razón**: Son datos estáticos, no utilidades. El nombre más descriptivo indica que son rutinas predefinidas.
  
- **Mover**: `src/utils/seedExercises.js` → `src/data/seedExercises.js`
  - **Razón**: Es un archivo de datos de seed, no una utilidad.

#### 2.4. Debug utils a carpeta organizada
- **Mover**: `src/utils/debug.js` → `src/utils/debug/debug.js`
- **Mover**: `src/utils/debugProfile.js` → `src/utils/debug/debugProfile.js`
- **Mover**: `src/utils/debugRoutines.js` → `src/utils/debug/debugRoutines.js`
- **Razón**: Agrupar todas las utilidades de debug en una subcarpeta para mejor organización.

#### 2.5. Assets organizados
- **Mover**: `src/assets/GB-LOGOAZULCLARO.png` → `src/assets/images/GB-LOGOAZULCLARO.png`
- **Mover**: `src/assets/GB-LOGOBLANCO.png` → `src/assets/images/GB-LOGOBLANCO.png`
- **Mover**: `src/assets/GB-LOGONEGRO.png` → `src/assets/images/GB-LOGONEGRO.png`
- **Razón**: Organizar imágenes en una subcarpeta `images/` para mejor estructura.

---

### 3. REORGANIZACIÓN DE ESTILOS CSS

#### 3.1. Crear estructura de carpetas para estilos
Los estilos se organizarán en:
- `styles/common/` - Estilos globales y compartidos
- `styles/components/` - Estilos por componente, organizados por dominio
- `styles/pages/` - Estilos específicos de páginas

#### 3.2. Movimientos de archivos CSS

**A `styles/common/`:**
- `Global.css`
- `Variables.css`
- `ThemeContrast.css`
- `PWAVariables.css`

**A `styles/components/auth/`:**
- `Auth.css`

**A `styles/components/common/`:**
- `Button.css`
- `ConfirmDialog.css`
- `LoadingSpinner.css`
- `NotificationSystem.css`
- `Toast.css`

**A `styles/components/home/`:**
- `Home.css`
- `HomeDashboard.css`
- `WeeklyCalendar.css`

**A `styles/components/layout/`:**
- `Footer.css`
- `Layout.css`
- `Navbar.css`

**A `styles/components/navigation/`:**
- `HeaderTabs.css`

**A `styles/components/progreso/`:**
- `BodyCompositionStudies.css`
- `BodyFatCalculator.css`
- `Evolution.css`
- `ExerciseLog.css`
- `MacroCalculator.css`
- `MacroDistributionChart.css`
- `ProfessionalTracking.css`
- `ProgresoCards.css`
- `ProgresoPage.css`
- `ProgressDashboard.css`
- `ProgressTabs.css`
- `StudyComparison.css`
- `StudyExportButton.css`
- `UnifiedBodyChart.css`

**A `styles/components/rutinas/`:**
- `CalendarioRutina.css`
- `CustomExercisesManager.css`
- `CustomRoutineBuilder.css`
- `Formulario.css`
- `InfoEjercicioCard.css`
- `RoutineSelector.css`
- `RoutinesManager.css`

**A `styles/components/pwa/`:**
- `PWAInstallBanner.css`
- `PWAStatusIndicator.css`

**A `styles/components/theme/`:**
- `ThemeToggle.css`

**A `styles/components/usuario/`:**
- `Profile.css`
- `UserProfile.css`

**A `styles/pages/`:**
- `about.css`

---

### 4. RENOMBRAMIENTOS Y TRADUCCIONES

#### 4.1. Archivos a renombrar (manteniendo funcionalidad)
- `src/utils/rutinas.js` → `src/data/rutinasPredefinidas.js`
  - **Razón**: Nombre más descriptivo que indica que son rutinas predefinidas, no utilidades.

#### 4.2. Consideraciones sobre traducción
**NO se traducirán al español:**
- Nombres de archivos de componentes React (convención estándar)
- Nombres de hooks (convención estándar: `use*`)
- Nombres de stores (convención estándar)
- Nombres técnicos (utils, services, etc.)

**SÍ se traducirán o mejorarán:**
- Solo cuando mejore la claridad (ej: `rutinas.js` → `rutinasPredefinidas.js`)

---

### 5. ACTUALIZACIÓN DE IMPORTS

#### 5.1. Imports afectados por movimientos de hooks

**Archivos que importan `useSessionOptimization`:**
- `src/App.jsx`: Cambiar `./utils/useSessionOptimization` → `./hooks/useSessionOptimization`

**Archivos que importan `useEjerciciosAgrupados`:**
- `src/components/rutinas/RutinaGlobalOptimized.jsx`: Cambiar `../../utils/useEjerciciosAgrupados.js` → `../../hooks/useEjerciciosAgrupados.js`
- `src/components/RutinaGlobalOptimized.jsx` (a eliminar): No requiere cambio

**Archivos que importan `useEjerciciosDelDiaDB`:**
- Buscar y actualizar todos los imports de este hook.

#### 5.2. Imports afectados por movimientos de componentes

**FormularioOptimized:**
- `src/pages/home.jsx`: Cambiar `../components/FormularioOptimized` → `../components/rutinas/FormularioOptimized`
- `src/pages/profile.jsx`: Cambiar `../components/FormularioOptimized` → `../components/rutinas/FormularioOptimized`
- `src/components/rutinas/RoutineSelector.jsx`: Cambiar `../FormularioOptimized` → `./FormularioOptimized`
- `src/components/common/LazyComponent.jsx`: Cambiar `../FormularioOptimized.jsx` → `../rutinas/FormularioOptimized.jsx`
- `src/components/FormularioOptimized.jsx`: Cambiar `../utils/rutinas` → `../data/rutinasPredefinidas` (y mover archivo a rutinas/)

**LogoutConfirmDialog:**
- `src/contexts/LogoutContext.jsx`: Cambiar `../components/LogoutConfirmDialog` → `../components/usuario/LogoutConfirmDialog`

**PWAInstallBanner:**
- Buscar y actualizar todos los imports.

**PWAStatusIndicator:**
- Buscar y actualizar todos los imports.

**ThemeToggleOptimized:**
- `src/components/layout/NavbarOptimized.jsx`: Cambiar `../ThemeToggleOptimized` → `../theme/ThemeToggleOptimized`

**UserProfileOptimized:**
- `src/pages/profile.jsx`: Cambiar `../components/UserProfileOptimized` → `../components/usuario/UserProfileOptimized`

#### 5.3. Imports afectados por movimientos de datos

**rutinas.js → rutinasPredefinidas.js:**
- `src/utils/debugRoutines.js`: Cambiar `./rutinas.js` → `../data/rutinasPredefinidas.js`
- `src/components/FormularioOptimized.jsx`: Cambiar `../utils/rutinas` → `../data/rutinasPredefinidas` (después de moverlo a rutinas/)
- Buscar otros archivos que importen `rutinas.js` y actualizar.

**seedExercises.js:**
- `src/components/rutinas/RutinaGlobalOptimized.jsx`: Cambiar `../../utils/seedExercises.js` → `../../data/seedExercises.js`
- `src/components/FormularioOptimized.jsx`: Cambiar `../utils/seedExercises.js` → `../data/seedExercises.js` (después de moverlo a rutinas/)
- `src/components/RutinaGlobalOptimized.jsx` (a eliminar): No requiere cambio
- Buscar otros archivos que importen `seedExercises` y actualizar.

#### 5.4. Imports afectados por movimientos de debug utils

**debugProfile.js:**
- `src/main.jsx`: Cambiar `./utils/debugProfile.js` → `./utils/debug/debugProfile.js`

**debugRoutines.js:**
- Actualizar imports si hay alguno.

#### 5.5. Imports afectados por movimientos de assets

**Imágenes:**
- `src/components/layout/NavbarOptimized.jsx`: 
  - `../../assets/GB-LOGOBLANCO.png` → `../../assets/images/GB-LOGOBLANCO.png`
  - `../../assets/GB-LOGOAZULCLARO.png` → `../../assets/images/GB-LOGOAZULCLARO.png`
- `src/components/common/LoadingSpinnerOptimized.jsx`: 
  - `"/src/assets/GB-LOGOAZULCLARO.png"` → `"/src/assets/images/GB-LOGOAZULCLARO.png"`
- `src/components/auth/AuthPage.jsx`: 
  - `"/src/assets/GB-LOGONEGRO.png"` → `"/src/assets/images/GB-LOGONEGRO.png"`
- Buscar otros archivos que importen estas imágenes y actualizar rutas.

#### 5.6. Imports afectados por reorganización de estilos

**Estilos globales:**
- `src/main.jsx`: 
  - `./styles/Global.css` → `./styles/common/Global.css`
  - `./styles/ThemeContrast.css` → `./styles/common/ThemeContrast.css`

**Estilos de componentes:**
Todos los imports de CSS en componentes deben actualizarse según la nueva estructura. Por ejemplo:
- `../styles/Home.css` → `../../styles/components/home/Home.css`
- `../styles/CalendarioRutina.css` → `../../styles/components/rutinas/CalendarioRutina.css`
- etc.

---

## 🔍 Archivos que Requieren Actualización de Imports

### Archivos con imports a actualizar:

1. **src/App.jsx**
   - `./utils/useSessionOptimization` → `./hooks/useSessionOptimization`

2. **src/main.jsx**
   - `./styles/Global.css` → `./styles/common/Global.css`
   - `./styles/ThemeContrast.css` → `./styles/common/ThemeContrast.css`
   - `./utils/debugProfile.js` → `./utils/debug/debugProfile.js`

3. **src/pages/home.jsx**
   - `../components/FormularioOptimized` → `../components/rutinas/FormularioOptimized`
   - `../styles/Home.css` → `../styles/components/home/Home.css`

4. **src/pages/profile.jsx**
   - `../components/UserProfileOptimized` → `../components/usuario/UserProfileOptimized`
   - `../components/FormularioOptimized` → `../components/rutinas/FormularioOptimized`
   - Actualizar imports de estilos relacionados

5. **src/components/rutinas/RoutineSelector.jsx**
   - `../FormularioOptimized` → `./FormularioOptimized`

6. **src/components/common/LazyComponent.jsx**
   - `../FormularioOptimized.jsx` → `../rutinas/FormularioOptimized.jsx`

7. **src/components/layout/NavbarOptimized.jsx**
   - `../ThemeToggleOptimized` → `../theme/ThemeToggleOptimized`
   - `../../assets/GB-LOGOBLANCO.png` → `../../assets/images/GB-LOGOBLANCO.png`
   - `../../assets/GB-LOGOAZULCLARO.png` → `../../assets/images/GB-LOGOAZULCLARO.png`
   - Actualizar imports de estilos relacionados

8. **src/components/rutinas/RutinaGlobalOptimized.jsx**
   - `../../utils/useEjerciciosAgrupados.js` → `../../hooks/useEjerciciosAgrupados.js`
   - `../../utils/seedExercises.js` → `../../data/seedExercises.js`
   - Actualizar imports de estilos relacionados

9. **src/contexts/LogoutContext.jsx**
   - `../components/LogoutConfirmDialog` → `../components/usuario/LogoutConfirmDialog`

10. **src/utils/debugRoutines.js**
    - `./rutinas.js` → `../data/rutinasPredefinidas.js`

11. **src/components/FormularioOptimized.jsx** (antes de moverlo)
    - `../utils/rutinas` → `../data/rutinasPredefinidas`
    - `../utils/seedExercises.js` → `../data/seedExercises.js`

12. **src/components/common/LoadingSpinnerOptimized.jsx**
    - `"/src/assets/GB-LOGOAZULCLARO.png"` → `"/src/assets/images/GB-LOGOAZULCLARO.png"`

13. **src/components/auth/AuthPage.jsx**
    - `"/src/assets/GB-LOGONEGRO.png"` → `"/src/assets/images/GB-LOGONEGRO.png"`

14. **Todos los archivos que importen estilos CSS**
   - Actualizar según la nueva estructura de carpetas

10. **Todos los archivos que importen assets**
    - Actualizar rutas de imágenes

---

## ✅ Beneficios de la Reestructuración

### 1. **Eliminación de Duplicaciones**
- Elimina confusión sobre qué archivo usar
- Reduce el tamaño del proyecto
- Facilita el mantenimiento

### 2. **Organización por Dominio**
- Componentes relacionados están juntos
- Fácil de encontrar código relacionado
- Mejor escalabilidad

### 3. **Separación Clara de Responsabilidades**
- Hooks en `hooks/`, no en `utils/`
- Datos estáticos en `data/`, no en `utils/`
- Servicios separados de componentes

### 4. **Estructura de Estilos Organizada**
- Fácil de encontrar estilos de un componente
- Mejor mantenibilidad
- Evita conflictos de nombres

### 5. **Mejor Onboarding**
- Nueva estructura más intuitiva
- Sigue convenciones estándar de React
- Fácil de entender para nuevos desarrolladores

### 6. **Preparación para Escalabilidad**
- Estructura lista para crecer
- Fácil agregar nuevos módulos
- Separación clara facilita testing

---

## ⚠️ Consideraciones Importantes

### 1. **Orden de Ejecución**
1. Primero crear las nuevas carpetas
2. Mover archivos (no copiar, para mantener historial de git)
3. Actualizar imports
4. Eliminar archivos duplicados
5. Probar que todo funciona

### 2. **Testing**
- Después de cada grupo de cambios, verificar que la aplicación compila
- Probar funcionalidades críticas
- Verificar que no hay imports rotos

### 3. **Git**
- Hacer commits incrementales por sección
- Usar `git mv` para mover archivos y mantener historial
- Hacer backup antes de empezar

### 4. **Compatibilidad**
- Verificar que Vite puede resolver las nuevas rutas
- Verificar que todos los imports relativos son correctos
- Asegurar que las rutas de assets funcionan

---

## 📊 Resumen de Cambios por Categoría

### Archivos a Eliminar: 2
- `src/components/AuthOnly.jsx` (duplicado)
- `src/components/RutinaGlobalOptimized.jsx` (duplicado)

### Archivos a Mover: ~45
- 3 hooks desde `utils/` a `hooks/`
- 6 componentes a nuevas carpetas organizadas
- 2 archivos de datos desde `utils/` a `data/`
- 3 archivos de debug a subcarpeta
- 3 assets a subcarpeta
- ~28 archivos CSS a nueva estructura

### Archivos a Renombrar: 1
- `rutinas.js` → `rutinasPredefinidas.js`

### Imports a Actualizar: ~50+
- Todos los archivos que importan los archivos movidos
- Todos los archivos que importan estilos CSS
- Todos los archivos que importan assets

---

## 🎯 Próximos Pasos Recomendados (Opcional)

Después de esta reestructuración, se podrían considerar:

1. **Crear servicios separados**: Extraer lógica de negocio de `lib/supabase.js` a servicios en `services/`
2. **TypeScript**: Considerar migración gradual a TypeScript
3. **Tests**: Agregar estructura de tests
4. **Documentación**: Agregar README por módulo
5. **Barrel exports**: Crear `index.js` en carpetas para facilitar imports

---

## 📌 Notas Finales

- Esta propuesta mantiene toda la funcionalidad existente
- No cambia la lógica de negocio
- Solo reorganiza la estructura física del código
- Sigue buenas prácticas de React/Vite
- Facilita el mantenimiento futuro
- Mejora la experiencia del desarrollador

---

**¿Deseas que proceda con la implementación de estos cambios?**

