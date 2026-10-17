# Auditoría SEO de GQR Labs

Fecha: 2026-10-17  
Estado: auditoría estática de código; build y validación del HTML generado pendientes.

## Resumen ejecutivo

Se confirmó un problema de canonicalización en el layout compartido: `canonical` y `og:url` apuntan siempre a la portada, también desde capacitación y las páginas legales. Esto puede hacer que los buscadores interpreten esas páginas como duplicadas de la portada y consoliden señales en la URL equivocada. También se encontraron enlaces de contacto de WhatsApp con un teléfono de marcador y una precarga global del poster de portada en páginas que no lo usan.

La landing `/landing/` contiene `noindex, nofollow` tanto para robots como para Googlebot; se considera una decisión intencional presente en el código, no un error por sí sola. El sitemap manual solo anuncia portada y capacitación. Las páginas legales tienen directiva global `index, follow` pero no aparecen en ese sitemap; hace falta confirmar si se desea que sean indexables antes de recomendar añadirlas o excluirlas.

No se modificó el sitio ni se instalaron dependencias. No se pudo ejecutar el build, así que los hallazgos se basan en el código fuente y los recursos existentes, no en HTML de `dist/` ni en respuestas del sitio desplegado.

## Alcance y limitaciones

- Revisados: `package.json`, configuración Astro, `tsconfig.json`, páginas, layouts, componentes relevantes, `public/`, estilos globales y recursos multimedia.
- No se encontró `report-template.md`, `src/content/` ni una configuración de colecciones de contenido.
- No se encontraron archivos de configuración de despliegue adicionales en los nombres inspeccionados; sí hay adaptador de Cloudflare en Astro.
- El entorno no dispone de `node`, `pnpm`, `npm`, `corepack`, `bun` ni `deno`. `pnpm exec astro --version` terminó con `pnpm: command not found`; `dist/` no existía. No se ejecutaron build, tests, lint ni validaciones de HTML/XML.
- No se consultó el sitio desplegado, no se verificaron respuestas HTTP, redirecciones, enlaces externos, Lighthouse, datos de campo ni Core Web Vitals.
- Los tamaños indicados son los archivos locales medidos con `du`; no son métricas de descarga o rendimiento en producción.
- El estado Git estaba limpio antes de generar este informe.

## Arquitectura SEO detectada

- Astro declarado en `package.json` como `^7.4.0`; la versión efectivamente instalada no pudo consultarse.
- Renderizado configurado como `output: "static"`, con adaptador `@astrojs/cloudflare` y servicio de imágenes `compile`.
- Sin `site`, `base` ni `trailingSlash` explícitos en `astro.config.mjs`. El dominio `https://gqrlabs.com` aparece en canonical, Open Graph, robots y sitemap, pero no está centralizado como `site` de Astro.
- Integración de Microsoft Clarity habilitada para producción.
- Sin framework de UI detectado en las dependencias declaradas; se usa Astro y `astro:assets`.
- Rutas estáticas identificadas: `/`, `/capacitacion`, `/landing/`, `/legal/politica-de-privacidad` y `/legal/terminos-y-condiciones`. No se detectaron rutas dinámicas en las páginas inspeccionadas.
- El sitio observado es monolingüe en español (`lang="es"`); no se encontró necesidad de `hreflang`.
- No se detectó CMS ni generación integrada del sitemap. `public/sitemap.xml` y `public/robots.txt` son archivos manuales.
- Scripts disponibles en `package.json`: `dev`, `dev:clean`, `build`, `preview` y `astro`; no hay scripts declarados de test o lint.

## Hallazgos priorizados

### SEO-01: Canonical y URL de Open Graph fijos a la portada

- **Severidad:** ALTO
- **Categoría:** SEO técnico, canonicalización y metadatos sociales
- **Estado:** Confirmado en código; el efecto de indexación no se verificó en buscadores.
- **Archivos:** [Layout.astro](src/layouts/Layout.astro#L29), [Layout.astro](src/layouts/Layout.astro#L30), [Layout.astro](src/layouts/Layout.astro#L78)
- **Rutas afectadas:** `/capacitacion`, `/legal/politica-de-privacidad` y `/legal/terminos-y-condiciones`. En `/` el valor coincide con la ruta.
- **Evidencia:** El layout compartido aplica `index, follow`, pero emite `https://gqrlabs.com/` como canonical y `og:url` sin considerar la URL actual. Las tres páginas indicadas usan ese layout. El sitemap, por separado, anuncia `/capacitacion` como URL propia.
- **Impacto potencial:** Los buscadores pueden interpretar cada página secundaria como una versión canónica de la portada y consolidar señales en una URL distinta. Al compartir enlaces, también se informa la URL de portada para páginas secundarias.
- **Recomendación:** Construir canonical y `og:url` absolutos a partir del dominio de producción y la ruta actual, respetando una política de slash coherente con el hosting. Centralizar el dominio de producción en la configuración Astro para evitar duplicar literales.
- **Verificación posterior:** Ejecutar build y comprobar en el HTML de cada ruta que haya exactamente un canonical absoluto propio, que no haya duplicados y que `og:url` coincida con esa ruta.

### SEO-02: Enlaces de WhatsApp con teléfono de marcador

- **Severidad:** MEDIO
- **Categoría:** Enlaces y experiencia de contacto
- **Estado:** Confirmado en código; no se probó la respuesta externa.
- **Archivo:** [index.astro](src/pages/landing/index.astro#L61)
- **Ruta afectada:** `/landing/`, con CTA de navegación, hero y secciones posteriores.
- **Evidencia:** Los enlaces usan `https://wa.me/598XXXXXXXX`; el mismo marcador aparece en las líneas 96, 426, 520 y 532 del archivo.
- **Impacto potencial:** Los CTA principales pueden dirigir a un destino no válido y bloquear el contacto. Es un fallo funcional; no se afirma que afecte directamente la indexación. La página está marcada `noindex, nofollow` en las líneas 29-30.
- **Recomendación:** Sustituir el marcador por el destino de contacto confirmado por el responsable del sitio, o retirar los CTA hasta disponer del dato real. No inventar ni inferir el teléfono.
- **Verificación posterior:** Revisar todos los enlaces `wa.me` de la página y abrirlos desde la URL desplegada para confirmar que llevan al canal correcto.

### SEO-03: El sitemap no refleja la política de indexación declarada para las páginas legales

- **Severidad:** MEDIO
- **Categoría:** Rastreo e indexabilidad
- **Estado:** Probable; requiere confirmar la intención editorial.
- **Archivos:** [sitemap.xml](public/sitemap.xml#L3), [sitemap.xml](public/sitemap.xml#L10), [Layout.astro](src/layouts/Layout.astro#L29), [Footer.astro](src/layouts/Footer.astro#L51)
- **Rutas afectadas:** Páginas legales, enlazadas desde el footer y servidas con `index, follow` por el layout.
- **Evidencia:** El sitemap manual contiene únicamente `/` y `/capacitacion`; el footer enlaza términos y privacidad. Las páginas legales usan el layout compartido con robots `index, follow`.
- **Impacto potencial:** El sitemap no ayuda a descubrir esas rutas si se pretende que formen parte del conjunto de páginas indexables. Su ausencia en el sitemap no las hace no indexables ni impide que se encuentren por enlaces internos.
- **Recomendación:** Confirmar la política prevista para las páginas legales. Si deben ser indexables, incluir sus URLs canónicas en el sitemap. Si se deben excluir, establecer una directiva `noindex` apropiada y mantenerlas accesibles para los usuarios; no usar `robots.txt` como sustituto.
- **Verificación posterior:** Comparar las directivas robots y canonical del HTML generado con el sitemap publicado y la decisión editorial para cada ruta.

### SEO-04: Precarga del poster de portada en todas las páginas del layout

- **Severidad:** BAJO
- **Categoría:** Rendimiento y prioridad de recursos
- **Estado:** Confirmado en código; impacto de rendimiento no medido.
- **Archivo:** [Layout.astro](src/layouts/Layout.astro#L63)
- **Rutas afectadas:** Todas las páginas que usan el layout compartido, incluidas capacitación y las páginas legales.
- **Evidencia:** El layout precarga `/images/home-video-poster.jpg` con `fetchpriority="high"` globalmente. El recurso mide aproximadamente 48 KB en el workspace; el video que acompaña solo aparece en el hero de la portada.
- **Impacto potencial:** En rutas sin ese poster, la precarga puede descargar un recurso no visible y competir por prioridad con recursos propios de la página. No se afirma un efecto medido en LCP o Core Web Vitals.
- **Recomendación:** Limitar la precarga a la portada o a las rutas que realmente muestran ese poster.
- **Verificación posterior:** Revisar la pestaña Network y una traza de rendimiento en portada, capacitación y páginas legales; confirmar que el recurso se prioriza solo donde aporta.

## Páginas revisadas

| Ruta | Tipo y metadatos observados | Contenido / estado | Observación |
|---|---|---|---|
| `/` | Layout compartido; título y descripción predeterminados; `lang="es"` | H1 de soluciones de software en el Hero; contenido principal se compone en Astro | Canonical y `og:url` apuntan correctamente a la portada. |
| `/capacitacion` | Título y descripción específicos en [index.astro](src/pages/capacitacion/index.astro#L6) | H1 y contenido de capacitación en componente Astro | Canonical y `og:url` del layout apuntan a `/`; la ruta sí aparece en el sitemap. |
| `/legal/politica-de-privacidad` | Título y descripción específicos; layout en [index.astro](src/pages/legal/politica-de-privacidad/index.astro#L5) | H1 y contenido legal estructurado | Canonical fijo a portada; ruta no incluida en sitemap. |
| `/legal/terminos-y-condiciones` | Título y descripción específicos; layout en [index.astro](src/pages/legal/terminos-y-condiciones/index.astro#L5) | H1 y contenido legal estructurado | Canonical fijo a portada; ruta no incluida en sitemap. |
| `/landing/` | Documento HTML autónomo; título y descripción propios; `noindex, nofollow` | H1, contenido y navegación por anclas; sin layout compartido | No aparece en sitemap; enlaces de WhatsApp usan teléfono marcador. Canonical y salida compilada no comprobados. |

## Otras observaciones

- La portada, capacitación y páginas legales tienen títulos/descripciones definidos y H1 visibles en el código. La página principal obtiene sus valores predeterminados de `Layout.astro`; las demás páginas compartidas pasan título y descripción explícitos.
- El layout declara charset UTF-8, viewport, favicon, Open Graph y un JSON-LD `WebSite`. Se observó un único bloque JSON-LD en el layout; no se validó el HTML emitido ni el JSON con un validador.
- `robots.txt` permite el rastreo general, excluye `/cgi-bin/` y declara el sitemap. No impide el rastreo de `/landing/`; su directiva `noindex` está en el documento HTML.
- Los enlaces de navegación de la portada apuntan a IDs presentes en componentes inspeccionados. En el landing, las anclas `como-funciona`, `planes` y `preguntas` tienen secciones correspondientes.
- Se usan componentes `Image` de Astro para varios recursos gráficos. El video de fondo de la portada tiene poster y dos fuentes responsivas. Los archivos medidos son: video móvil de portada 276 KB, video desktop de portada 1,2 MB, poster 48 KB, video móvil del landing 672 KB, video desktop del landing 1,2 MB y Open Graph 248 KB. No se midieron transferencia real, formatos/variantes generados ni impacto en métricas.
- La integración de Clarity añade un recurso de terceros en producción. Su impacto de rendimiento no se midió.
- No se encontró una etiqueta `twitter:card`; es una mejora social opcional, no un bloqueo SEO ni un hallazgo de severidad alta.
- No se recomiendan `hreflang` para el sitio monolingüe observado.

## Comprobaciones ejecutadas

- Inspección estática de configuración, páginas, componentes, layouts, sitemap, robots, enlaces y recursos.
- Revisión de existencia de plantilla de informe, colecciones de contenido, configuraciones de despliegue comunes y rutas dinámicas; no se localizaron.
- Medición local de tamaños de medios con `du`.
- Intento de obtener versión de Astro y build: bloqueado porque `pnpm` y `node` no están instalados en el entorno. No se instalaron herramientas ni dependencias.

## Plan de acción priorizado

### Correcciones críticas y altas

- Corregir canonical y `og:url` en el layout para que describan cada ruta pública y coincidan con la estrategia de URLs del despliegue.

### Correcciones medias

- Confirmar los datos reales de contacto y corregir o desactivar los enlaces de WhatsApp con marcador.
- Decidir si las páginas legales deben indexarse y alinear sitemap y directivas robots con esa decisión.

### Mejoras de rendimiento y calidad

- Restringir la precarga del poster de portada a las páginas que lo utilizan.
- Revisar mediante navegador la carga de videos, fuentes y Clarity; medir antes de priorizar cambios de rendimiento.
- Considerar `twitter:card` solo si la estrategia de compartir en X requiere control específico además de Open Graph.

### Seguimiento y medición

- En un entorno con Node y pnpm, ejecutar `pnpm build` e inspeccionar el HTML de las cinco rutas, `dist/sitemap.xml` y `dist/robots.txt`.
- Tras desplegar correcciones, comprobar status HTTP, redirecciones, canonical y metadatos desde las URLs públicas.
- Usar Search Console y datos de campo para evaluar indexación y Core Web Vitals; no inferir resultados de posicionamiento a partir del código o del sitemap.
