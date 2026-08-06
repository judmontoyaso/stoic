# Respuesta a la revisión de Lemon Squeezy

LS pidió tres cosas para aprobar la tienda: desglose de precios, video
demo y URL del sitio. Todo existe — este doc lo empaqueta.

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
> | Founder — 12 months of access | $59 USD, one-time | Full 90-day program (2 parallel tracks), advanced 30-day season, daily emails and push notifications delivered at each user's own hour and timezone, journal, progress dashboard. Limited to the first 100 founders. |
>
> The Lemon Squeezy checkout sells the **Founder access: a single
> $59 USD payment that grants 12 months**. Please note this is a
> **one-time payment product, not a subscription** — Lemon Squeezy never
> charges the customer again, and there is nothing for the customer to
> cancel. Access simply expires after 12 months unless the customer
> chooses to buy again. We track the expiry date in our own database, not
> through Lemon Squeezy billing.
>
> When access expires, the customer gets a 30-day window in which they can
> download their complete journal (free, no payment required), after which
> the personal content is deleted. This is stated on the pricing page
> itself and in our refund policy, not buried in the terms.
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
> 0:10  Pricing section — $59 USD one-time payment, 12 months of access
> 0:22  Sign in with Google
> 0:28  Day 45 of 90 — the daily exercise and its full written lesson
> 0:48  Marking the day as complete
> 0:54  Evening journal (Seneca's nightly review)
> 1:04  Calendar — completed and missed days stay visible
> 1:12  Settings — email hour and timezone, set by each user
> 1:18  One of the daily emails, as received
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

Antes de enviar: confirma que el precio del producto en el dashboard de
LS es efectivamente $59 (los docs internos lo sugieren; la cifra final
vive en LS, no en el código).

**Y confirma que el producto en LS sigue siendo `one-time payment`, NO
`subscription`.** El modelo es un pago único que da 12 meses: la vigencia
la lleva StoiCom en su base de datos, no la facturación de LS.
Configurarlo como suscripción cobraría automáticamente al año, que es
exactamente lo que este modelo evita y lo contrario de lo que dice el
correo de arriba.

## 2. Guion del video demo (60–90 s, grabar con Loom u OBS)

Pantalla + narración breve en inglés (o subtítulos). Usa una cuenta ya
aprobada con un track activo para que haya contenido real.

**Ojo con el checkout.** El botón de pago en USD está inactivo hasta que
LS verifique la tienda, así que NO se puede filmar su checkout en uso —
es circular. No pasa nada: lo que LS necesita comprobar es que el
producto existe, funciona y coincide con lo que se cobra. El precio se
muestra en la sección de precios de la landing, y el correo lo explica.

| # | Toma | Qué mostrar | ~seg |
|---|---|---|---|
| 1 | `stoicom.app/landing` | Scroll lento por el hero y la metodología. | 10 |
| 2 | `/landing#precios` | La sección de precios: $59 USD / COP 199.000, pago único por un año, y los 7 días gratis. Baja hasta el bloque "Qué pasa cuando se acaba el año". **Esta es la toma clave**: LS verifica que lo anunciado es lo que se cobra, y ese bloque le contesta de antemano la pregunta de qué pasa al vencer. | 14 |
| 3 | `/login` | Botón de Google; entra con la cuenta demo. | 6 |
| 4 | `/today` ("Hoy") | El día actual: cita, ejercicio del día, abrir la lección completa (400–550 palabras). Es el corazón del producto: que se vea contenido real, no una plantilla. | 20 |
| 5 | Marcar completado | Toggle del ejercicio; se ve el avance del día. | 6 |
| 6 | `/journal` | Examen nocturno de Séneca: las tres preguntas por escrito. | 10 |
| 7 | `/calendar` | Días completados y perdidos: los perdidos se quedan marcados. | 6 |
| 8 | `/settings` | Hora de correos y zona horaria: el usuario controla cuándo recibe. | 6 |
| 9 | Correo real | Abrir el correo matutino en la bandeja: el producto también se entrega por correo. | 10 |

Cierre sugerido: dejar unos segundos en el calendario, donde se ven los
días perdidos sin reorganizar.

### ¿Hay que narrar en inglés?

**No.** Tres opciones, de menos a más esfuerzo — cualquiera sirve:

1. **Mudo (recomendado).** Solo el screencast. El contexto en inglés va
   escrito en el correo, con la lista de tiempos de abajo. Es lo que
   envía la mayoría de comercios y evita el riesgo de trabarse.
2. **Narrado en español.** El producto ES en español y el revisor va a
   ver la interfaz en español de todos modos; el correo ya lo advierte.
3. **Narrado en inglés.** Solo si te sale natural. No suma puntos.

Si grabas mudo, pega esta lista en el correo para que el revisor sepa
qué está viendo (ajusta los segundos a tu grabación real):

```
0:00  Public landing page
0:10  Pricing section — $59 USD one-time payment, 12 months of access
0:22  Sign in with Google
0:28  Day 45 of 90 — the daily exercise and its full written lesson
0:48  Marking the day as complete
0:54  Evening journal (Seneca's nightly review)
1:04  Calendar — completed and missed days
1:12  Settings — email hour and timezone per user
1:18  One of the daily emails, as received
```

Consejos: ventana del navegador limpia (sin extensiones ni bookmarks),
idioma del sistema no importa (el producto es en español — di en la
narración "the product is in Spanish, targeting the LatAm market").

## 3. Checklist antes de responder

- [ ] Precio del producto en el dashboard de LS = **$59** (debe coincidir
      con lo que muestra la landing, que sale de `src/lib/pricing.ts`)
- [ ] El producto en LS es **one-time payment**, no subscription
- [ ] `supabase_v14_vigencia.sql` ejecutado (si no, la landing anuncia un
      año y el webhook no escribe vencimiento: incoherencia justo en lo
      que LS está revisando)
- [ ] La landing ya NO dice "vitalicio" ni "de por vida" en ningún lado:
      `grep -ri "vitalici\|de por vida" src/`
- [ ] La cuenta demo tiene un track activo **con varios días marcados**:
      una cuenta recién creada se ve vacía y no demuestra nada
- [ ] `ayuda@stoicom.app` recibe (LS suele probar el contacto de soporte)
- [ ] `/terms`, `/privacy` y `/reembolsos` cargan desde incógnito
- [ ] Video subido a Loom o YouTube **no listado**; LS acepta enlace
