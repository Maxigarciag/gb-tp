# Resumen de cambios (2025-12-12)

- Se alineó el estilo de los CTA de las tarjetas de nutrición con el botón primario del héroe, usando la misma clase y realzando la llamada a la acción dentro de cada card.
- Se simplificó el copy del héroe de nutrición retirando la frase sobre experiencia en escritorio y móvil.
- Se retiraron los accesos rápidos (CTA) del héroe de nutrición, dejando sólo el texto y el badge.
- Se homogeneizó la altura y el padding de las cards de nutrición y se fijó el botón al fondo para que todos queden alineados.
- Se removieron las insignias/badges de cada card en la grilla de nutrición.
- Se alineó el ícono del header de la calculadora de macros con el título ajustando el flex del contenedor.
- Se re-centra el header de la calculadora y se ajusta el icono para que quede a la misma altura que el título, limpiando offsets adicionales.
- Se unificó el estilo de los botones de género y de acción en la calculadora de macros para que coincidan con los botones primarios/secundarios del resto de nutrición.
- Se actualizó el botón “Nuevo Estudio” de composición corporal para usar el mismo estilo primario (color de acento, borde y sombra) que el resto de botones.
- Se retiró el eyebrow “Nueva sección” del héroe de nutrición para simplificar la cabecera.
- Se ajustó el copy de la calculadora por alimento para que explique claramente que calcula calorías y macros por porción y permite guardar el resultado para usarlo luego.
- Se eliminó el eyebrow “Nutrición” en la calculadora por alimento para limpiar la cabecera de esa vista específica.
- Se reintrodujo el eyebrow “Nueva sección” únicamente en la landing principal de nutrición.
- Se añadieron ajustes responsive para móvil en la cabecera simple de nutrición (alineado centrado y tipografías reducidas) para que la vista se sienta más ligera en pantallas pequeñas.
- Se retiró la insignia “Optimizado para móvil” de la calculadora por alimento y se limpiaron sus estilos asociados.
- Se eliminó el eyebrow “Nutrición” del Registro de Comidas para simplificar esa cabecera.
- Se dejó el módulo de Registro de Comidas con solo el `MealsTracker`, removiendo cabecera y checklist informativos.
- Se hizo transparente y sin padding/borde el contenedor de Registro de Comidas para que el tracker se vea ancho y sin marco.
- Se retiró el encabezado del Registro de Comidas y se agregó margen superior al tracker para mantener el espaciado.
- Se añadió un ligero padding superior al contenedor del Registro de Comidas para evitar que se corten las tarjetas del tracker.
- Se redondearon las esquinas superiores de las tarjetas del tracker de comidas asegurando `overflow: hidden` en cada card.
- Se mejoró el contraste de las tarjetas de totales del tracker en tema oscuro, haciendo que los textos hereden color y usando un tono oscuro en los fondos degradados.
- Las tarjetas de cada comida ahora solo aparecen cuando hay alimentos cargados; si no hay ninguno se muestra un breve mensaje y se mantiene el formulario.
- La función edge `search-nutrition` ahora usa la API key desde secretos (`NUTRITION_API_KEY`), responde 204 en OPTIONS y retorna 502 con logging si falla la API externa.

