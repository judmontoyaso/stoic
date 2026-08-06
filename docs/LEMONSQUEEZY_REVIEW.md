# Respuesta a la revisión de Lemon Squeezy

LS pidió tres cosas para aprobar la tienda: desglose de precios, video
demo y URL del sitio. Todo existe — este doc lo empaqueta.

> **Ojo, esto cambió.** El modelo pasó de acceso vitalicio a **un año de
> vigencia**, y se quitó el marco de "fundador" de todo lo que ve el
> cliente. Si ya habías grabado el video antes de agosto de 2026, hay que
> volver a grabarlo: la landing es otra.

---

## 0. Antes de grabar: qué tocar en los paneles

### Lemon Squeezy

| Campo | Debe decir | Por qué |
|---|---|---|
| Nombre del producto | **StoiCom · Acceso completo (1 año)** | Si dice "Founder" contradice la landing, y lo primero que LS compara es eso |
| Tipo de pago | **One-time payment**, NO subscription | La vigencia la lleva StoiCom en su base de datos. Ponerlo como suscripción cobraría solo al año, justo lo contrario de lo que dice el correo de abajo |
| Precio | **$59 USD** | Debe coincidir con `src/lib/pricing.ts` |
| Descripción | Un año de acceso al programa completo. Pago único, sin suscripción. | — |

### Mercado Pago

**No hay que tocar nada en el panel.** El título y la descripción que ve
el comprador se arman por código en `src/lib/mercadopago.ts`, y ya dicen
"StoiCom · Acceso completo, 1 año". Solo confirma que
`MERCADOPAGO_FOUNDER_PRICE` en Vercel siga en 199000 (el nombre de la
variable quedó con "founder" a propósito: renombrarla obliga a tocarla en
Vercel y no aporta nada al cliente).

---

## 1. Borrador de respuesta (inglés, listo para pegar)

> Hi,
>
> Thank you for the review. Here are the requested details:
>
> **Website URL:** https://stoicom.app/landing
> (Terms: https://stoicom.app/terms · Privacy: https://stoicom.app/privacy
> · Refund policy: https://stoicom.app/reembolsos)
>
> **Support contact:** ayuda@stoicom.app (also in the footer of every
> email we send)
>
> **Product:** StoiCom is a 90-day communication training program in
> Spanish, based on applied Stoic philosophy. Users receive one concrete
> daily exercise with a full written lesson (morning email + web app),
> an evening journaling review, weekly challenges, and progress
> tracking. After the 90 days there is an advanced 30-day season.
>
> **Pricing breakdown:**
> | Tier | Price | What it includes |
> |---|---|---|
> | Free email course | $0 | First 7 days of the program, delivered by email (lead magnet) |
> | Full access — 12 months | $59 USD, one-time | Full 90-day program (2 parallel tracks), advanced 30-day season, daily emails and push notifications delivered at each user's own hour and timezone, journal with optional voice dictation, AI reading of the user's own journal, progress dashboard. |
>
> Please note this is a **one-time payment product, not a
> subscription**. Lemon Squeezy never charges the customer again and
> there is nothing for the customer to cancel: access simply expires
> after 12 months unless they choose to buy again. We track the expiry
> date in our own database, not through Lemon Squeezy billing.
>
> When access expires, the customer gets a 30-day window in which they
> can download their complete journal (free, no payment required), after
> which the personal content is deleted. This is stated on the pricing
> page itself and in our refund policy, not buried in the terms.
>
> We also accept Mercado Pago for LatAm customers (COP $199,000, same
> product and same 12-month term) — Lemon Squeezy is our international
> rail.
>
> **Demo video:** link below. The product interface is in Spanish, since
> that is our market, so here is what each part shows:
>
> ```
> 0:00  Public landing page
> 0:12  Pricing — $59 USD one-time payment, 12 months of access
> 0:24  What happens when the year ends (grace period + free journal export)
> 0:34  Sign in with Google
> 0:40  Day 45 of 90 — the daily exercise and its full written lesson
> 1:00  Marking the day as complete
> 1:06  Evening journal (Seneca's nightly review)
> 1:16  AI reading of the user's own journal, quoting their entries
> 1:28  Calendar — completed and missed days stay visible
> 1:36  Settings — email hour and timezone, set by each user
> 1:42  One of the daily emails, as received
> ```
>
> One note on the video: our USD checkout button is currently disabled
> on the site, showing "coming soon", because the Lemon Squeezy store is
> still pending verification. The product and the Lemon Squeezy checkout
> are already configured at $59 USD and will be enabled as soon as the
> store is approved. In the meantime LatAm customers can pay via Mercado
> Pago, which is why that is the only active button today.
>
> Let me know if you need anything else.

---

## 2. Guion del video (90–110 s)

Usa una cuenta ya aprobada **con varios días marcados y con diario
escrito**: una cuenta recién creada se ve vacía y no demuestra nada. La
lectura con IA necesita al menos 6 entradas del mes para existir.

**El checkout en USD no se puede filmar**: está inactivo hasta que LS
verifique, y grabarlo sería circular. No pasa nada — lo que LS comprueba
es que el producto existe, funciona y coincide con lo que se cobra.

| # | Toma | Qué mostrar | ~seg |
|---|---|---|---|
| 1 | `stoicom.app/landing` | Scroll lento por el hero. Que se lea el titular y el gancho de los 7 días gratis. | 12 |
| 2 | `/landing#precios` | **La toma clave.** El precio en las dos monedas, "un año", "pago único" y "sin suscripción". Detente aquí. | 12 |
| 3 | Sigue bajando | El bloque **"Qué pasa cuando se acaba el año"**. Es nuevo y le contesta al revisor la pregunta que iba a hacer: qué pasa al vencer, los 30 días de gracia y la descarga gratis del diario. | 10 |
| 4 | `/login` | Botón de Google; entra con la cuenta demo. | 6 |
| 5 | `/today` | El día actual: cita, ejercicio y abrir la lección completa (400–550 palabras). Que se vea contenido real, no plantilla. | 20 |
| 6 | Marcar completado | Toggle del ejercicio. | 6 |
| 7 | `/journal` | Examen nocturno: las tres preguntas por escrito. Si te animas, toca **Dictar** y di una frase para que se vea la transcripción. | 10 |
| 8 | `/evaluation` | **Toma nueva y la que más suma.** La lectura del diario con IA, donde se ven las citas del propio usuario con su fecha. Demuestra que hay producto de verdad detrás del precio. | 12 |
| 9 | `/calendar` | Días completados y perdidos: los perdidos se quedan marcados. | 6 |
| 10 | `/settings` | Hora de correos y zona horaria. | 6 |
| 11 | Correo real | Abrir el correo matutino en la bandeja. | 10 |

Cierre: unos segundos en el calendario, con los días perdidos sin
reorganizar.

### Título y descripción del Loom (pegar tal cual)

El revisor abre el enlace antes de leer el correo, así que el título y la
descripción tienen que sostenerse solos. Van en inglés y con los enlaces
dentro: si el video se comparte entre revisores, la información viaja con
él.

**Título:**

```
StoiCom — product demo for store review (Spanish-language app)
```

**Descripción:**

```
Product demo for Lemon Squeezy store verification.

StoiCom is a 90-day communication training program in Spanish, based on
applied Stoic philosophy. The interface is in Spanish because that is our
market (LatAm), so the timestamps below describe what each part shows.

Product: one-time payment of $59 USD granting 12 months of access.
Not a subscription — no recurring charges, nothing to cancel.

Website:        https://stoicom.app/landing
Terms:          https://stoicom.app/terms
Privacy:        https://stoicom.app/privacy
Refund policy:  https://stoicom.app/reembolsos
Support:        ayuda@stoicom.app

0:00  Public landing page
0:12  Pricing — $59 USD one-time payment, 12 months of access
0:24  What happens when the year ends (grace period + free journal export)
0:34  Sign in with Google
0:40  Day 45 of 90 — the daily exercise and its full written lesson
1:00  Marking the day as complete
1:06  Evening journal (Seneca's nightly review)
1:16  AI reading of the user's own journal, quoting their entries
1:28  Calendar — completed and missed days stay visible
1:36  Settings — email hour and timezone, set by each user
1:42  One of the daily emails, as received

Note: the USD checkout button currently shows "coming soon" because this
store is pending verification. The product and checkout are already
configured at $59 USD and will be enabled once approved.
```

Ajusta los segundos a tu grabación real antes de pegarlo, y usa los
mismos en el correo — que no se contradigan.

En Loom: deja el video en **"Anyone with the link"**. Si queda restringido
al equipo, el revisor abre una pantalla de permiso y te devuelve el caso
sin mirarlo.

### ¿Narrado?

**Mudo es lo recomendado.** Solo el screencast; el contexto en inglés va
escrito en el correo, con la lista de tiempos de arriba (ajusta los
segundos a tu grabación real). Es lo que envía la mayoría de comercios y
evita el riesgo de trabarse. Narrar en español también sirve — el
producto ES en español y el correo ya lo advierte. En inglés, solo si te
sale natural; no suma puntos.

Consejos de grabación: ventana limpia, sin extensiones ni barra de
marcadores, y sin pestañas abiertas que revelen otras cosas.

---

## 3. Checklist antes de responder

- [ ] Producto en LS: nombre **sin "Founder"**, one-time payment, $59
- [ ] `MERCADOPAGO_FOUNDER_PRICE` en Vercel sigue en 199000
- [ ] `supabase_v14_vigencia.sql` y `supabase_v15_voz_analisis.sql` ejecutados
- [ ] Nada de "vitalicio" ni "fundador" en la web:
      `grep -rniE "vitalici|de por vida|fundador" src/app src/components`
- [ ] La cuenta demo tiene días marcados **y** 6+ entradas de diario del
      mes, o la toma 8 (la lectura con IA) sale vacía
- [ ] `ayuda@stoicom.app` recibe (LS suele probar el contacto de soporte)
- [ ] `/terms`, `/privacy` y `/reembolsos` cargan desde incógnito
- [ ] Video en Loom o YouTube **no listado**; LS acepta enlace
