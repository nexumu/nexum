# Nexum - Diseño de Home (v1)

## Objetivo

Pasar de una tienda con look de template a una experiencia de marca mas personal para Nexum, manteniendo claridad comercial y foco en conversion.

## Direccion visual

- Estetica: calida, editorial y premium-accesible (hogar + bebidas).
- Tono: cercano, cotidiano, confiable.
- Color: base crema suave con acentos tierra y oliva para evitar look generico.
- Tipografia: titulares serif expresivos + cuerpo sans limpio (ya presente en el proyecto).
- Textura: fondos con gradientes suaves y capas de vidrio leve en header.

## Navbar (inspirada en referencia 2)

### Estructura

1. Franja superior de servicio como carrusel de oraciones (autoplay + flechas):
   - "Envios a todo el pais"
   - "Hasta 12 pagos sin interes con tarjeta de credito"
   - "Cambios simples dentro de los primeros 15 dias"
2. Barra principal sticky:
   - Logo a la izquierda.
   - Navegacion centrada en desktop.
   - Busqueda y carrito a la derecha.
   - Menu hamburguesa en mobile.

### Comportamiento

- Sticky con blur y borde inferior suave.
- Navbar principal con fondo de color de marca (verde) y alto contraste.
- Estados hover discretos, sin ruido visual.
- Mobile: sheet lateral con links y buscador.

## Hero (arriba de todo)

### Objetivo

Comunicar propuesta de valor en los primeros segundos.

### Contenido

- Eyebrow contextual.
- Titulo principal enfocado en uso real (casa, oficina, movimiento).
- Texto corto con beneficio concreto.
- CTA primario: ver productos.
- CTA secundario: seleccion de marca.

### Recurso visual

- Carrusel de imagenes con autoplay.
- Overlay de contraste para asegurar lectura.
- Tarjetas informativas de confianza (envio, curaduria, cambios).
- Debe ocupar toda la pantalla visible (full screen), sin `max-w` contenedor.

## Seccion de palabras en carrusel (autoplay)

### Objetivo

Reforzar atributos de marca con ritmo visual.

### Reglas

- Franja dedicada debajo del hero.
- Palabras cortas de identidad (ej: calidez, ritual, diseno, hogar, regalo).
- Movimiento automatico continuo con pausa suave.
- Legible en mobile y desktop.

## Contenido personalizado (home)

### Bloques

1. Novedades (producto).
2. Seleccion Nexum (producto).
3. FAQ util y concreta.

### Lineamientos de copy

- Hablar en lenguaje cotidiano, no tecnico.
- Explicar usos y contexto, no solo caracteristicas.
- Evitar frases vacias tipo template.

## Orden de implementacion (top-down)

1. Navbar (estructura y estilo final).
2. Hero (layout, copy, CTA, autoplay).
3. Franja de palabras en carrusel (autoplay).
4. Ajustes de espaciado/continuidad visual hacia secciones de producto.
5. Resto de secciones personalizadas.

## Criterios de aceptacion

- Se percibe visual de marca propia, no template base.
- Navbar y primer scroll reflejan la referencia pedida.
- Existe seccion de palabras en carrusel con avance automatico.
- Home mantiene legibilidad y buen comportamiento en mobile y desktop.
- No se rompe flujo comercial (busqueda, navegacion, carrito).
