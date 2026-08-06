# Plan de acción — vigencia, Lemon Squeezy y primeras reseñas

Estado: el modelo pasó de "acceso vitalicio" a **un año de vigencia con
precio de renovación congelado**. Este doc es el orden en que hay que
ejecutar, y por qué ese orden y no otro.

## 1. Orden de ejecución

El orden importa. La landing ya anuncia un año; si el webhook todavía no
escribe vencimiento, lo anunciado y lo entregado no coinciden — y eso es
exactamente lo que Lemon Squeezy está revisando ahora mismo.

### Paso 0 — Migración, ANTES del deploy

```
supabase_v14_vigencia.sql   → SQL Editor de Supabase
```

Hace dos cosas: marca `stoicom_lifetime` a **todos los que ya compraron**
(pagaron por "acceso vitalicio" y lo conservan) y crea
`stoic.lifecycle_emails` para el dedupe de los avisos.

Verifica en la salida que `vitalicios_blindados` coincida con el número
de compradores que tenías. Si sale 0 y sabes que hay compras, revisa que
esas cuentas tengan `stoicom_plan = 'founder'` antes de seguir.

### Paso 1 — Panel de Lemon Squeezy

- Precio del producto = **$59 USD** (debe coincidir con `src/lib/pricing.ts`).
- El producto es **one-time payment**, NO subscription. La vigencia la
  lleva StoiCom en su base de datos; ponerlo como suscripción en LS
  cobraría automáticamente al año, que es lo contrario de lo que dice el
  correo de revisión.

### Paso 2 — Deploy

No hace falta cron nuevo en `vercel.json`: `/api/cron/vigencia` se ejecuta
dentro del lote de `/api/cron/emails`, que ya corre dos veces al día.

### Paso 3 — Probar el ciclo en seco

```
GET /api/cron/vigencia?secret=<CRON_SECRET>&dry=1
```

Lista a quién le tocaría cada aviso sin enviar ni borrar nada. Hazlo antes
de dejarlo suelto: es el único cron del proyecto que borra datos.

### Paso 4 — Video y envío a LS

`docs/LEMONSQUEEZY_REVIEW.md` ya está actualizado con el modelo real.
Ojo con la toma 2: ahora hay que bajar hasta el bloque "Qué pasa cuando se
acaba el año", que es lo que le contesta al revisor la pregunta obvia.

Antes de grabar: `grep -ri "vitalici\|de por vida" src/` debe salir vacío.

### Paso 5 — Las primeras 25 reseñas

`/admin` → tarjeta "Reseñas fundadoras" → invitar.

Va a los leads con `drip_day = 7`, sin comprar, sin baja y con doble
opt-in confirmado: terminaron los siete días gratis, conocen el producto y
aceptaron recibir correo. Cada uno recibe un código único de campaña
`resena-fundador` que le da el año completo.

El trato que se les propone está en el correo: acceso gratis a cambio de
una opinión honesta al mes, **incluida la mala**. Una reseña negativa
escrita en serio vale más que un aplauso, porque dice qué arreglar.

Al mes, escríbeles tú a mano. Ahí salen los testimonios de la landing.

## 2. Dónde buscar tracción (y dónde no)

### Sí: los leads que ya tienes

Es lo del paso 5 y es lo primero porque **todo lo demás convierte mejor
con reseñas que sin ellas**. Ya están en la base, ya dijeron que sí y no
cuestan nada.

### Sí: video corto en español, después

Hay 180 ejercicios escritos, o sea 180 guiones ya hechos. El nicho de
estoicismo en español está saturado de contenido de frases; mostrar **el
ejercicio concreto del día** es lo que diferencia. Canal de volumen, pero
lento: necesita prueba social primero.

Ver la skill `marketing` para hooks y estructura.

### No: regar códigos en Reddit

No es por las reglas de autopromo, es por idioma. r/Stoicism tiene ~800k
miembros angloparlantes y el producto es en español: los mandarías a una
landing que no pueden leer. Los subs de estoicismo en español son de pocos
miles y con reglas estrictas — regar códigos ahí quema el único sitio que
sí era relevante. Reddit sirve más adelante, participando de verdad.

### No: correo frío a listas scrapeadas

Esta es la cara. El drip de 7 días sale de `notifications.stoicom.app` en
Resend. Correo no solicitado desde ese dominio genera quejas de spam,
Resend suspende la cuenta y se cae **el embudo entero que ya funciona y ya
está probado en producción**. El intercambio es pésimo: unos pocos correos
fríos que convierten cerca de cero contra el activo de captación completo.

Si algún día hay outbound, sale de un dominio distinto y desechable.

## 3. Decisiones tomadas en este cambio

| Decisión | Por qué |
|---|---|
| Los compradores anteriores quedan vitalicios | Compraron eso. Cambiarles el trato después de cobrar no es opción |
| Becas y códigos de campaña pasan a un año | Una beca vitalicia valdría más que el producto pagado |
| El código compartido de la env NO vence | Es la beta privada: probaron gratis cuando esto no funcionaba |
| Renovar temprano suma, no reinicia | Quien paga con dos meses de sobra no puede perderlos |
| No se puede pagar con más de 60 días restantes | Evita el doble cobro por olvido, que es la queja de soporte más cara |
| La política de borrado va en la página de precios | Escondida en los términos es una trampa; dicha de frente es confianza |
| El diario se puede descargar siempre, gratis | Convierte el borrado en algo anunciable, y cubre portabilidad (Ley 1581) |
| `stoic.payments` y `stoic.events` no se borran | Obligación contable y métricas de cohorte, sin contenido escrito por el usuario |

## 4. Funciones nuevas (hechas 2026-08-06)

Ambas necesitan **`supabase_v15_voz_analisis.sql` ejecutado**. Sin eso el
dictado rechaza por falta de consentimiento y el análisis se genera pero
no se cachea (o sea, se vuelve a pagar en cada visita).

- **Lectura mensual del diario** (`/evaluation`). DeepSeek lee las
  entradas del mes y devuelve el patrón que se repite, la contradicción
  entre el principio y el final, lo que evita y lo que mejoró — **citando
  sus frases con la fecha**. Esa regla de citar es lo único que separa
  esto de un horóscopo. Se genera solo cuando el usuario la pide y se
  cachea por mes. ~$0,004 USD por informe.

  Es además la razón de renovación del año 2: el programa de 90 días no
  cambia, pero un análisis con un año de historia detrás sí.

  **Probado contra datos reales** con `npx tsx --env-file=.env
  src/scripts/probar-analisis.ts <correo>`. Tardó 46,5 s con
  `deepseek-v4-pro`. Ver el aviso de tiempo límite abajo.

- **Dictado por voz** (Deepgram, en cada campo del diario). Tope de 60
  min/mes por usuario (~$0,26 al mes en el peor caso) y consentimiento
  explícito guardado en `user_prefs.voice_consent_at` antes del primer
  uso: el audio sale hacia un tercero fuera del país y eso se pregunta,
  no se asume (Ley 1581). La llave vive solo en el servidor.

- **Correo con la lectura mensual** (`/api/cron/analisis`, dentro del lote
  de `/api/cron/emails`). Sale los primeros 5 días de cada mes y habla
  del mes anterior, ya cerrado. Solo a quien escribió 6 entradas o más:
  con tres sueltas el análisis no dice nada y el correo quema la función.

  Va **solo el primer párrafo** más el enlace, nunca el informe completo.
  El análisis cita textualmente el diario, y la bandeja de entrada es el
  sitio menos privado donde eso puede acabar (vistas previas en pantalla
  de bloqueo, buzones compartidos, reenvíos). Además el clic a la app es
  lo que interesa: ahí está el resto del producto y ahí se renueva.

  Dedupe en `stoic.lifecycle_emails` con `kind='analisis_mensual'`, así
  que no hizo falta otra migración.

  Probar sin esperar al día 1:
  `GET /api/cron/analisis?secret=...&month=2026-07&dry=1`

### ⚠️ Aviso serio: el análisis tarda entre 46 y 57 s

Dos mediciones reales con `deepseek-v4-pro` (lo que hay hoy en
`DEEPSEEK_MODEL`): **46,5 s y 57,3 s**. Va creciendo y ya roza el minuto.

Eso pega en dos sitios distintos:

1. **La petición del usuario** (`POST /api/analysis/monthly`). Declara
   `maxDuration = 120`, que **solo se respeta en Vercel Pro**. En Hobby
   el tope son 60 s: con 57 s medidos, se cortaría a menudo.
2. **El cron**, que es peor porque procesa usuarios en serie. Con ~57 s
   cada uno y 280 s de presupuesto, salen **4 o 5 usuarios por pasada**.
   Con el cron corriendo dos veces al día y una ventana de 5 días, el
   techo es del orden de 40-50 usuarios al mes. Suficiente hoy; deja de
   serlo pronto.

**La salida, en los dos casos, es la misma variable:**

```
DEEPSEEK_ANALYSIS_MODEL=deepseek-chat
```

en Vercel. Responde bastante más rápido a cambio de algo de finura. La
variable existe justo para esto y no requiere tocar código. En Hobby es
obligatoria; en Pro es lo que sube el techo del cron.

## 5. Qué falta

- **SEO de contenido.** La base técnica ya está (ver `SEO.md`): raíz con
  rewrite, canónica, título por síntoma y FAQs con forma de búsqueda
  real. Falta lo que mueve la aguja: un artículo por síntoma, dos por
  semana, empezando por "muletillas", "me tiembla la voz" y "cómo dejar
  de interrumpir". Los 180 ejercicios escritos son 180 artículos.
- **Probar el dictado hablando de verdad.** Se verificó la llave, el
  endpoint y el parseo de la respuesta contra la API real, pero no la
  calidad de transcripción en español: hace falta grabar una entrada
  hablando y ver cómo queda.
