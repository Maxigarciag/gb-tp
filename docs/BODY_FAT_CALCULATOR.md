# Calculadora de Grasa Corporal - Método US Navy

## Descripción

La Calculadora de Grasa Corporal es una herramienta integrada en la aplicación de fitness que utiliza el método oficial de la Marina de EE.UU. para estimar el porcentaje de grasa corporal de manera precisa y confiable.

## Funcionalidades Principales

### 🎯 **Cálculo Automático de Grasa Corporal**
- **Método US Navy**: Utiliza las fórmulas oficiales de la Marina de EE.UU.
- **Precisión**: Cálculos basados en logaritmos para mayor exactitud
- **Validación**: Rangos de medición validados científicamente

### 👤 **Auto-completado Inteligente**
- **Datos del Perfil**: Automáticamente pre-llena género, altura y peso desde el perfil del usuario
- **Sincronización**: Se actualiza automáticamente cuando cambian los datos del perfil
- **Personalización**: Adapta la interfaz según el género del usuario

### 📊 **Resultados Detallados**
- **Porcentaje de Grasa**: Resultado principal con precisión decimal
- **Masa Grasa**: Cálculo de la masa grasa en kilogramos
- **Masa Magra**: Cálculo de la masa muscular en kilogramos
- **Categorización**: Clasificación automática según estándares de salud

### 🎨 **Interfaz Optimizada**
- **Título Mejorado**: Diseño que claramente identifica el título sin parecer un botón
- **Botones de Género**: Selector elegante con botones que cambian de estilo según la selección
- **Botón con Gradiente Brilloso**: Estilo visual idéntico al botón "Comenzar Entrenamiento" del home logueado
- **Tema Adaptativo**: Soporte completo para modo claro y oscuro
- **Responsive**: Diseño optimizado para todos los dispositivos

## Ubicación

La calculadora está integrada en la sección **"Composición Corporal"** dentro de la página de progreso, donde los usuarios pueden:

- Calcular su porcentaje de grasa corporal
- Ver su evolución en el tiempo
- Comparar mediciones anteriores
- Exportar datos para análisis

## Estructura de Archivos

```
src/
├── components/
│   └── progreso/
│       └── BodyFatCalculator.jsx    # Componente principal optimizado
└── styles/
    └── BodyFatCalculator.css        # Estilos con variables CSS y tema adaptativo
```

## Tecnologías Utilizadas

- **React**: Componentes funcionales con hooks optimizados
- **CSS Variables**: Sistema de temas claro/oscuro
- **Responsive Design**: Diseño adaptativo para todos los dispositivos
- **Performance**: Optimizaciones con useCallback y useMemo

## Optimizaciones Implementadas

### 🚀 **Performance**
- **useCallback**: Memoización de funciones para evitar re-renders
- **useMemo**: Cálculos optimizados para rangos saludables
- **useEffect**: Sincronización eficiente con datos del perfil

### 🎨 **UI/UX**
- **Título Estático**: Diseño que claramente identifica el contenido
- **Botones de Género**: Selector elegante con estilos intercalados según la selección
- **Botón Gradiente Brilloso**: Estilo visual idéntico a los botones del home logueado
- **Auto-completado**: Experiencia fluida sin necesidad de re-ingresar datos
- **Validación en Tiempo Real**: Feedback inmediato al usuario

### 🔧 **Código**
- **Constantes Centralizadas**: VALIDATION_RANGES y BODY_FAT_CATEGORIES
- **Funciones Reutilizables**: renderInputField para reducir duplicación
- **Manejo de Estado**: Gestión eficiente del estado del formulario
- **Integración con Perfil**: Uso del contexto de autenticación

## Fórmulas Utilizadas

### Hombres
```
%GC = 495 / (1.0324 - 0.19077 × log10(cintura - cuello) + 0.15456 × log10(altura)) - 450
```

### Mujeres
```
%GC = 495 / (1.29579 - 0.35004 × log10(cintura + cadera - cuello) + 0.22100 × log10(altura)) - 450
```

## Categorías de Grasa Corporal

### Hombres
- **Grasa Esencial**: 2-6%
- **Atlético**: 6-14%
- **Fitness**: 14-18%
- **Aceptable**: 18-25%
- **Obesidad**: >25%

### Mujeres
- **Grasa Esencial**: 10-12%
- **Atlético**: 12-21%
- **Fitness**: 21-25%
- **Aceptable**: 25-32%
- **Obesidad**: >32%

## Validaciones

### Rangos de Medición
- **Altura**: 100-250 cm
- **Peso**: 30-300 kg
- **Cuello**: 20-80 cm
- **Cintura**: 50-200 cm
- **Cadera**: 60-200 cm (solo mujeres)

### Validaciones de Resultado
- **Rango Lógico**: 2-50% de grasa corporal
- **Medidas Coherentes**: Verificación de proporciones corporales
- **Datos Requeridos**: Validación de campos obligatorios

## Integración con el Sistema

### 🔗 **Contexto de Autenticación**
- **useAuth Hook**: Acceso a datos del perfil del usuario
- **Sincronización Automática**: Actualización en tiempo real
- **Persistencia**: Mantiene datos entre sesiones

### 📊 **Almacenamiento de Resultados**
- **Callback onSaveMeasurement**: Integración con sistema de progreso
- **Formato Estandarizado**: Datos compatibles con la base de datos
- **Timestamp**: Registro automático de fecha y hora

## Responsive Design

### 📱 **Mobile First**
- **Grid Adaptativo**: Formulario que se ajusta al ancho de pantalla
- **Botones de Género Responsivos**: Tamaño adaptativo del selector de género
- **Botones Responsivos**: Adaptación automática del tamaño
- **Espaciado Inteligente**: Márgenes y padding adaptativos

### 💻 **Desktop**
- **Layout Optimizado**: Aprovechamiento del espacio disponible
- **Interacciones Mejoradas**: Hover effects y transiciones
- **Tipografía Escalable**: Tamaños de fuente responsivos

## Accesibilidad

### ♿ **Características de Accesibilidad**
- **Labels Semánticos**: Asociación correcta de labels con inputs
- **Botones de Género Accesibles**: Selector con estados claros y navegación por teclado
- **Contraste Optimizado**: Cumplimiento de estándares WCAG
- **Navegación por Teclado**: Soporte completo para navegación sin mouse
- **Mensajes de Error**: Feedback claro y descriptivo

## Contribución

Para contribuir al desarrollo de la calculadora:

1. **Fork del repositorio**
2. **Crear rama feature**: `git checkout -b feature/body-fat-calculator-improvement`
3. **Implementar cambios** siguiendo las convenciones del proyecto
4. **Testing**: Verificar funcionamiento en diferentes dispositivos
5. **Pull Request**: Enviar cambios para revisión

## Convenciones de Código

- **Naming**: camelCase para variables y funciones
- **Componentes**: PascalCase para nombres de componentes
- **CSS**: BEM methodology para clases
- **Performance**: Uso de hooks de optimización cuando sea necesario

## Última Actualización

**Fecha**: 2025-01-20
**Versión**: 2.1.0
**Cambios**: 
- Auto-completado con datos del perfil del usuario
- Mejora visual del título para evitar confusión con botones
- **NUEVO**: Botones de género elegantes con estilos intercalados según selección
- **NUEVO**: Botón principal con gradiente brilloso idéntico al home logueado
- Optimización general del código y rendimiento
- Soporte completo para temas claro/oscuro
