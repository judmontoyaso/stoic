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
> **Demo video:** attached / link below. It shows: the public landing,
> sign-in with Google, the daily exercise with its full lesson, marking
> the day complete, the evening journal, and the settings where users
> control email schedule and timezone.
>
> Let me know if you need anything else.

Antes de enviar: confirma que el precio del producto en el dashboard de
LS es efectivamente $59 (los docs internos lo sugieren; la cifra final
vive en LS, no en el código).

## 2. Guion del video demo (60–90 s, grabar con Loom u OBS)

Pantalla + narración breve en inglés (o subtítulos). Usa una cuenta ya
aprobada con un track activo para que haya contenido real.

| # | Toma | Qué mostrar | ~seg |
|---|---|---|---|
| 1 | `stoicom.app/landing` | Scroll lento por el hero, "Así se ve un día" y "Qué incluye". | 12 |
| 2 | `/auth/verify` | Las puertas de entrada, incluido el botón **"Hazte fundador"** → clic → se abre el checkout de Lemon Squeezy con el precio (clave para LS: aquí ven su checkout en uso). | 12 |
| 3 | `/login` | Botón de Google; entra con la cuenta demo. | 6 |
| 4 | `/today` ("Hoy") | El día actual: cita, ejercicio del día, abrir la lección completa (400–550 palabras). | 18 |
| 5 | Marcar completado | Toggle del ejercicio; se ve el avance del día. | 6 |
| 6 | `/journal` | Examen nocturno de Séneca: las tres preguntas por escrito. | 10 |
| 7 | `/settings` | Hora de correos, zona horaria: el usuario controla cuándo recibe. | 6 |
| 8 | Correo real | Abrir el correo matutino recibido (muestra el producto entregado por email). | 10 |

Cierre: pantalla del calendario con días completados/perdidos ("no
streak inflation — missed days stay visible").

Consejos: ventana del navegador limpia (sin extensiones ni bookmarks),
idioma del sistema no importa (el producto es en español — di en la
narración "the product is in Spanish, targeting the LatAm market").

## 3. Checklist antes de responder

- [ ] Precio en el dashboard de LS = $59 (o ajustar el borrador)
- [ ] La cuenta demo tiene un track activo con días completados (que no
      se vea vacía)
- [ ] Video subido (Loom da URL directa; LS acepta link)
- [ ] `/terms`, `/privacy` y `/reembolsos` cargan bien desde incógnito
