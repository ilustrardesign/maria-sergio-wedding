# Dirección fotográfica - Maria & Sérgio

Todas las fotografías usadas provienen de `Fotos Extraídas de la Página Web/Fotos Elegidas`. No se utilizaron fotos de `Fotos no Autorizadas`.

| Sección | Foto seleccionada | Origen | Función narrativa | Orientación original | Tratamiento | Object-position desktop | Object-position mobile | Overlay | Derivado |
|---|---|---|---|---|---|---|---|---|---|
| Hero desktop / landscape | `hero-desktop.png` | `Imagen Horizontal.png` | Primera impresión emocional con crop horizontal preparado manualmente: texto en área izquierda y Maria & Sérgio como foco romántico en el campo derecho/central. | Horizontal 16:9 | `<picture>` con `getImageProps`; asset elegido por `media="(orientation: landscape), (min-aspect-ratio: 1/1)"`; `object-fit: cover` sin zoom agresivo | `center` | N/A | Gradiente marfil mínimo lateral + viñeta inferior muy suave para legibilidad, elegido porque conserva más fotografía que el tratamiento fuerte anterior | No |
| Hero mobile / portrait | `hero-mobile.png` | `Imagen Vertical.png` | Mantiene la composición mobile que ya funcionaba: beso protagonista, nombre con presencia y lectura sobre overlay inferior. | Vertical portrait | Fallback del `<picture>` para portrait; asset preparado específicamente para teléfono y tablet portrait | N/A | `51% 32%` | Overlay inferior oscuro/oliva ya calibrado para lectura mobile | No |
| Nossa História 01 | `story-staircase-kiss.jpg` | `01 - MARIA&SERGIO_74.jpg` | Apertura ceremonial e íntima; la escalera aporta solemnidad sin reemplazar el hero de papelería. | Vertical 2:3 | `next/image`, crop CSS, marco editorial | `50% 22%` | `50% 20%` | Marfil suave | No |
| Nossa História 02 | `story-palace-walk.jpg` | `12 - MARIA&SERGIO_12.jpg` | Movimiento y arquitectura clásica; funciona como capítulo de transición. | Vertical 2:3 | `next/image`, crop CSS | `50% 20%` | `50% 18%` | Ninguno | No |
| Nossa História 03 | `story-balcony-quiet.jpg` | `22 - MARIA&SERGIO_6.jpg` | Cierre contemplativo e íntimo antes de volver a secciones informativas. | Vertical 2:3 | `next/image`, crop CSS | `50% 18%` | `50% 16%` | Oliva suave | No |
| Galeria 01 | `gallery-garden-embrace.jpg` | `03 - MARIA&SERGIO_99.jpg` | Fachada blanca, vegetación y abrazo; conecta exterior con identidad marfil/oliva. | Vertical 2:3 | Crop CSS en slot portrait | `52% 44%` | `52% 34%` | Marfil suave | No |
| Galeria 02 | `gallery-bench-laughter.jpg` | `05 - MARIA&SERGIO_149.jpg` | Momento espontáneo y luminoso para variar la serie. | Vertical 2:3 | Crop CSS en slot landscape | `50% 20%` | `50% 18%` | Ninguno | No |
| Galeria 03 | `gallery-salon-distance.jpg` | `10 - MARIA&SERGIO_28.jpg` | Plano abierto y silencioso; da respiro frente a primeros planos. | Vertical 2:3 | Crop CSS en slot square | `50% 47%` | `50% 40%` | Ninguno | No |
| Galeria 04 | `gallery-rooftop-lamp.jpg` | `14 - MARIA&SERGIO_127.jpg` | Línea vertical, cielo y gesto; aporta aire exterior. | Vertical 2:3 | Crop CSS en slot portrait | `50% 44%` | `50% 31%` | Marfil suave | No |
| Galeria 05 | `gallery-ballroom-motion.jpg` | `20 - MARIA&SERGIO_42.jpg` | Movimiento en salón; suma ritmo sin repetir la historia. | Vertical 2:3 | Crop CSS en slot landscape | `50% 21%` | `50% 18%` | Ninguno | No |
| Galeria 06 | `gallery-mirror-embrace.jpg` | `24 - MARIA&SERGIO_44.jpg` | Reflejo y marco dorado; cierra la galería con señal editorial. | Vertical 2:3 | Crop CSS en slot portrait | `50% 43%` | `50% 32%` | Oliva suave | No |

## Reemplazo futuro

Cuando lleguen los archivos finales del fotógrafo, sustituir los JPG de `public/images/wedding/preview/` conservando nombres y proporciones de uso. Si las composiciones finales tienen más aire o diferente encuadre, ajustar solo `imageTreatment`/`treatment` en `src/content/wedding.ts`.

Para el hero actual, sustituir `public/images/wedding/hero/hero-desktop.png` y `public/images/wedding/hero/hero-mobile.png` por versiones finales equivalentes. La selección responsive se hace en HTML con `<picture>` + `getImageProps`, evitando descargar simultáneamente los dos assets grandes. Tablet portrait usa la versión vertical; tablet landscape, laptop, desktop y ultrawide usan la horizontal.

## Descartes relevantes

- `02 - MARIA&SERGIO_62.jpg`: muy cercana a la escalera elegida, pero con los sujetos más bajos y menos fuerza íntima.
- `04 - MARIA&SERGIO_72.jpg`: cromáticamente fuerte por la alfombra roja; se descartó para no competir con la sobriedad del sistema.
- `06 - MARIA&SERGIO_59.jpg`: retrato individual de Maria; bello, pero esta iteración prioriza narrativa de pareja.
- `07 - MARIA&SERGIO_113.jpg` y `08 - MARIA&SERGIO_112.jpg`: banco/fachada útiles, pero `05` resuelve mejor expresión y relación.
- `13 - MARIA&SERGIO_22.jpg`, `15 - MARIA&SERGIO_30.jpg`, `16 - MARIA&SERGIO_24.jpg`, `17 - MARIA&SERGIO_33.jpg`: interiores potentes, descartados para evitar repetición de salones oscuros.
- `18 - MARIA&SERGIO_96.jpg`: similar a `03`, con menos claridad del entorno.
- `19 - MARIA&SERGIO_144.jpg`: parecido a `05`; se priorizó la sonrisa frontal.
- `21 - MARIA&SERGIO_2.jpg.jpg`, `23 - MARIA&SERGIO_52.jpg`, `25 - MARIA&SERGIO_86.jpg`: buenos recursos editoriales, pero más oscuros o distantes para los slots actuales.
