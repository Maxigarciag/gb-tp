# Resumen 2025-12-12 - Nutrición

- Se añadió la ruta y carga diferida para la nueva calculadora por alimento en `nutricion/calculadora-alimento`, manteniendo el patrón de lazy loading.
- El menú principal de Nutrición ahora muestra una tarjeta dedicada y un acceso directo en el héroe a la calculadora por alimento.
- Se creó la página `FoodCalculatorPage` que reutiliza la calculadora existente del registro de comidas con encabezado y envoltorio consistentes.
- La navegabilidad de las calculadoras queda separada: macronutrientes, cálculo por alimento y registro de comidas, todas accesibles desde el hub de Nutrición.
- Se simplificó `RegistroComidas` removiendo la calculadora embebida; solo queda el flujo de registro diario.

