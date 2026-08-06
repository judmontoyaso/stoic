# SEO — a qué palabras apuntamos y por qué

## 1. El diagnóstico incómodo

Hay tres términos que parecen los obvios y son los tres que NO hay que pelear:

| Término | Por qué se pierde |
|---|---|
| `stoic` | La app Stoic (iOS) y Daily Stoic, con años de autoridad y backlinks. Además es inglés: quien lo busca no compra un producto en español |
| `estoicismo` | Wikipedia, medios y editoriales. Intención informativa: quien lo busca quiere leer qué es, no pagar un programa |
| `stoicom` | Volumen cero. Nadie busca una marca que no conoce |

Un dominio nuevo y sin backlinks no gana ninguna de esas. Pelearlas es gastar meses para quedar en la página cuatro.

## 2. Dónde sí se puede ganar

**La búsqueda por síntoma.** Alguien que escribe "cómo dejar de decir muletillas" tiene un problema concreto, quiere resolverlo hoy, y no está comparando filosofías. Es competencia baja, intención altísima, y describe literalmente lo que hace el producto.

Cuatro grupos, en orden de rentabilidad:

**A. Síntoma (la mina de oro).** Competencia baja, conversión alta.
- cómo dejar de decir muletillas
- por qué me tiembla la voz al hablar
- cómo hablar más pausado / más lento
- me quedo en blanco en las reuniones
- cómo dejar de interrumpir cuando hablo
- cómo hablar con mi jefe sin ponerme nervioso
- cómo dar una mala noticia en el trabajo

**B. Solución.** Competencia media, ya saben qué buscan.
- ejercicios para mejorar la comunicación
- ejercicios diarios para hablar mejor
- programa de comunicación asertiva
- cómo mejorar mi comunicación en 90 días

**C. Estoicismo aplicado.** El diferenciador, y mucho menos disputado que "estoicismo" a secas.
- examen nocturno de Séneca cómo hacerlo
- diario estoico en español
- ejercicios estoicos diarios
- estoicismo aplicado a la comunicación

**D. Alternativa.** Roba tráfico al líder, que es inglés-primero.
- app de estoicismo en español
- app de diario estoico en español

El grupo D es el más subestimado: la app Stoic no tiene versión seria en español y hay gente hispanohablante buscándola.

## 3. Qué ya está implementado

- **La raíz sirve la landing con rewrite, no redirect** (`src/proxy.ts`). Antes `/` redirigía a `/landing` y le regalaba a una subruta la autoridad de la URL más fuerte del dominio. Los enlaces que reciba `stoicom.app` apuntan a la raíz.
- **Canónica a `/`** y `/landing` fuera del sitemap: las dos URLs muestran lo mismo, y sin canónica sería contenido duplicado.
- **Título por síntoma, marca al final.** "Ejercicios diarios para hablar mejor: muletillas, nervios y voz · StoiCom". La marca no puede comer los 60 caracteres que Google muestra.
- **FAQs con forma de búsqueda real** (`src/data/faqs.ts`). Es la palanca más fuerte que hay: ya alimentan el bloque `FAQPage` del JSON-LD, y un fragmento destacado se gana con una respuesta directa, no con autoridad de dominio. Por eso cada respuesta CONTESTA en la primera frase.
- `metadataBase`, `lastModified` en el sitemap, y las palabras del grupo A dentro del H1 y del primer párrafo.

## 4. Lo que falta y es lo que de verdad mueve la aguja

**Un artículo por síntoma.** Ya existen 180 ejercicios escritos: cada uno es un artículo. La estructura que gana el fragmento destacado:

1. La pregunta como `<h1>`, tal como la teclean.
2. **La respuesta directa en las primeras 40-50 palabras.** Sin preámbulo. Si empieza con "La comunicación es fundamental...", Google no tiene qué mostrar.
3. El desarrollo: por qué pasa, el mecanismo.
4. El ejercicio concreto, con pasos.
5. CTA a los 7 días gratis. Nunca a la compra: en tráfico frío la venta directa quema la mejor cohorte.

Ritmo sostenible: dos por semana. Empezar por el grupo A, que es donde hay hueco.

**Ojo con la canibalización:** un artículo por intención. Si "muletillas" y "cómo dejar las muletillas" tienen artículo cada uno, compiten entre sí y pierden los dos.

**Enlazado interno:** cada artículo enlaza a la raíz con texto ancla descriptivo ("el programa de 90 días"), nunca "clic aquí".

## 5. Cómo medir

Search Console, en este orden y no otro:

1. **Impresiones** por consulta. Suben primero; si no suben, el contenido no entra en el índice.
2. **Posición media** de las consultas del grupo A. Es donde se debe ver movimiento en 4-8 semanas.
3. **CTR** por consulta. CTR bajo con buena posición = el título no promete lo que la búsqueda pide.
4. **Clics → correos capturados.** Lo único que importa al final.

No mirar tráfico total: sube y baja por ruido. Mirar consultas concretas del grupo A.

## 6. La expectativa honesta

El SEO no da nada los primeros dos o tres meses, y después da compuesto. No es el canal para conseguir los primeros clientes — para eso están los leads propios y el video corto (ver `PLAN_TRACCION.md`). Es el canal que en el mes seis trae gente todos los días sin pagar nada.

Montarlo ahora es correcto. Esperar resultados en tres semanas, no.
