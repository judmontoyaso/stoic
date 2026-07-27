---
name: redaccion
description: Cómo suena la prosa de StoiCom — tics de IA prohibidos, reglas de ritmo y concreción, y checklist de revisión. Úsalo al escribir o revisar CUALQUIER texto en prosa del proyecto (lecciones, correos, landing, guiones, docs) y al tocar los prompts de generación en src/lib/ai.ts.
---

# Redacción — StoiCom

La voz de marca (a quién le hablas, qué prometes, qué prohíbes) está en la
skill `marketing`. Esto es lo otro: **cómo se construye la frase** para que
no suene a texto generado.

Aplica igual a lo que escribes tú y a los prompts de `src/lib/ai.ts`, que
son los que producen las lecciones diarias. Si cambias una regla aquí,
cámbiala allá.

## 1. El problema

Un lector distingue texto de IA en dos párrafos. No por el contenido: por
la **simetría**. Párrafos del mismo largo, frases del mismo largo, cada
idea con su contraste, cada cierre con su moraleja. Suena a plantilla
rellenada. La escritura humana es desigual.

## 2. Tics prohibidos

**La antítesis de muleta.** El patrón más delator del español generado:

- ❌ "No se trata de hablar más, sino de hablar mejor."
- ❌ "No es una técnica. Es una forma de vivir."
- ❌ "No solo mejora tu voz, sino también tu presencia."

Prohibido en toda la pieza salvo **una** vez, y solo si el contraste es el
punto real del texto. Casi nunca lo es.

**Las tríadas.** Tres adjetivos, tres ejemplos, tres cláusulas. La IA
cuenta hasta tres siempre. Usa dos, o cuatro, o uno.

- ❌ "Claro, firme y directo."
- ✅ "Firme. Sin adornos."

**Aperturas de plantilla.** "Imagina esto:", "En un mundo donde...", "La
realidad es que...", "Todos hemos estado ahí.", "En el fondo,", "Piensa en
la última vez que...", "Hoy vas a..." (ya prohibida en el prompt).

**Cierres de superación.** "Y eso lo cambia todo.", "El cambio empieza
hoy.", "Recuerda:", "La decisión es tuya.", "Empieza ahora." Un cierre
puede terminar plano. Debe, casi siempre.

**Vocabulario inflado.** poderoso, profundo, transformador, viaje,
abrazar, desbloquear, potenciar, elevar, clave, esencia, pilar,
fundamental, resonar, empoderar, "un antes y un después".

**Andamiaje visible.** "Primero... Segundo... Por último", "Es
importante destacar que", "En resumen", cadenas de preguntas retóricas,
párrafos que anuncian lo que van a decir antes de decirlo.

**Resumen final.** El último párrafo NO recapitula lo anterior. Avanza o
se calla.

## 3. Reglas de construcción

**Ritmo desigual.** En cada párrafo, al menos una frase de menos de seis
palabras y al menos una larga de verdad. Si todas las frases miden igual,
el párrafo está muerto. Los párrafos también van desiguales: uno de dos
líneas junto a uno de siete.

**Concreción por defecto.** Nada de categorías abstractas donde cabe una
escena:

- ❌ "Las interrupciones afectan tu credibilidad."
- ✅ "Te interrumpió a los doce segundos y no volviste a tomar la palabra
  en toda la junta."

Nombres, horas, números, lugares. La junta de las 9. El mensaje que
llevas dos días sin responder. El audio de WhatsApp que grabaste tres
veces.

**La objeción va dentro.** Antes de que el lector piense "sí, pero en mi
caso...", el texto ya lo dijo por él y siguió. Sin pedir permiso, sin
"quizás pienses que".

**Verbo antes que sustantivo.** "decidir" mejor que "la toma de
decisiones". "escuchar" mejor que "la escucha activa" — salvo que sea el
nombre de la técnica.

**Sin hedging.** Nada de "puede que", "quizás", "en cierto modo", "de
alguna manera". Si es cierto, dilo. Si no lo sabes, no lo escribas.

**Tuteo, cero emojis, cero viñetas** en las lecciones y correos (las
viñetas sí valen en docs técnicos).

## 4. Checklist de revisión

Antes de dar por buena una pieza:

1. ¿Cuántos "no es X, sino Y"? Más de uno: reescribir.
2. ¿Hay tríadas? Rómpelas.
3. Lee el primer y el último párrafo seguidos. ¿El último resume? Bórralo.
4. ¿Alguna palabra de la lista inflada? Cámbiala por la concreta.
5. ¿Se puede sustituir un sustantivo abstracto por una escena? Hazlo.
6. Mide las frases del párrafo más largo. ¿Todas parecidas? Parte una,
   alarga otra.
7. Léelo en voz alta. Donde tu voz se aburre, el lector abandona.

## 5. Al tocar los prompts de generación

Los prompts de `src/lib/ai.ts` llevan estas reglas en negativo y en
positivo. Dos cosas al editarlos:

- Las lecciones ya generadas están **cacheadas** en `stoic.daily_readings`
  por `(track_id, day_number)`. Cambiar el prompt no reescribe lo viejo:
  hay que borrar esas filas o llamar a la generación con `refresh: true`.
- Prohibir sin dar alternativa empeora el texto: cada prohibición del
  prompt va con el "haz esto en su lugar".
