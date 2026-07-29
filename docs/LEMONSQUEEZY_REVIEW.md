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
> | Founder — lifetime access | $59 USD, one-time | Full 90-day program (2 parallel tracks), advanced 30-day season, daily emails and push notifications delivered at each user's own hour and timezone, journal, progress dashboard. No subscription, no recurring charges. Limited to the first 100 founders. |
>
> The Lemon Squeezy checkout sells the **Founder lifetime access**
> ($59 USD one-time). We also accept Mercado Pago for LatAm customers
> (COP $199,000, same product) — Lemon Squeezy is our international rail.
>
> **Demo video:** link below. It shows the public landing and its
> pricing section, sign-in with Google, the daily exercise with its full
> written lesson, marking the day complete, the evening journal, the
> calendar with completed and missed days, the settings where users
> control email schedule and timezone, and one of the daily emails as
> received.
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
| 2 | `/landing#precios` | La sección de precios: $59 USD / COP 199.000, pago único, y los 7 días gratis. **Esta es la toma clave**: LS verifica que el precio anunciado es el que se cobra. | 12 |
| 3 | `/login` | Botón de Google; entra con la cuenta demo. | 6 |
| 4 | `/today` ("Hoy") | El día actual: cita, ejercicio del día, abrir la lección completa (400–550 palabras). Es el corazón del producto: que se vea contenido real, no una plantilla. | 20 |
| 5 | Marcar completado | Toggle del ejercicio; se ve el avance del día. | 6 |
| 6 | `/journal` | Examen nocturno de Séneca: las tres preguntas por escrito. | 10 |
| 7 | `/calendar` | Días completados y perdidos: los perdidos se quedan marcados. | 6 |
| 8 | `/settings` | Hora de correos y zona horaria: el usuario controla cuándo recibe. | 6 |
| 9 | Correo real | Abrir el correo matutino en la bandeja: el producto también se entrega por correo. | 10 |

Cierre sugerido: la pantalla del calendario mientras se narra "missed
days stay visible — no inflated streaks".

Consejos: ventana del navegador limpia (sin extensiones ni bookmarks),
idioma del sistema no importa (el producto es en español — di en la
narración "the product is in Spanish, targeting the LatAm market").

## 3. Checklist antes de responder

- [ ] Precio del producto en el dashboard de LS = **$59** (debe coincidir
      con lo que muestra la landing, que sale de `src/lib/pricing.ts`)
- [ ] La cuenta demo tiene un track activo **con varios días marcados**:
      una cuenta recién creada se ve vacía y no demuestra nada
- [ ] `ayuda@stoicom.app` recibe (LS suele probar el contacto de soporte)
- [ ] `/terms`, `/privacy` y `/reembolsos` cargan desde incógnito
- [ ] Video subido a Loom o YouTube **no listado**; LS acepta enlace
