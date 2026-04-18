# Walkthrough: Sistema de Plantillas UDTS & PDF High-Fidelity

Hemos transformado la arquitectura de salida de Fiax, pasando de un diseño fijo a un sistema composible que captura la "riqueza" de iReport con tecnologías web modernas.

## 1. El Ensamblador de Bandas
La previsualización de facturas ahora es un **Ensamblador Dinámico** que lee la estructura del YAML. Esto permite reordenar secciones o cambiar estilos sin tocar el código.

```yaml
# Definición en MPT0710186W1.yml
template:
  structure:
    - band: 'Header'    # Encabezado Industrial
    - band: 'Parties'   # Emisor y Receptor Side-by-Side
    - band: 'Table'     # Tabla con columnas ERP (Pedido/Lote)
    - band: 'Totals'    # Desglose fiscal agrupado
    - band: 'Legal'     # Menciones IMMEX y Sellos Digitales
```

## 2. Motor Bilingüe Inteligente
Rescatamos el patrón `~ES~EN~` de las plantillas originales. El motor de reglas ahora resuelve estas etiquetas en tiempo real según el idioma del documento:
*   **Español**: "Lugar de Expedición"
*   **English**: "Place of Issue"

## 3. Exportación a PDF "Rich Layout"
Integración de `html2pdf.js` configurado para alta fidelidad (192-300 DPI). 
*   **Márgenes Dinámicos**: Controlados desde el YAML.
*   **Branding Inyectado**: Colores institucionales aplicados globalmente a través de variables CSS.

## 4. Portabilidad Mannesmann (Resumen de Cambios)
*   **Precios Industriales**: Formateo dinámico como `14.50 USD/LB`.
*   **Contexto ERP**: Visibilidad automática de columnas industriales solo si el documento lo requiere.
*   **Menciones Legales**: Inyección automatizada de leyendas IMMEX con tipografía optimizada.

---

> [!TIP]
> Puedes probar la exportación haciendo hover sobre la factura en el modo de previsualización y haciendo clic en el botón flotante **"Exportar PDF"**.

> [!IMPORTANT]
> El diseño ahora es **100% configurable** desde la pestaña "Reglas Inyectadas" en la configuración del emisor. Cualquier cambio en la clave `template.structure` se reflejará instantáneamente.
