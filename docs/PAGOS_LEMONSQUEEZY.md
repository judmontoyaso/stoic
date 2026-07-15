# Pagos con Lemon Squeezy — acceso fundador

Modelo: **pago único de por vida** ("Fundador"). Dos puertas de entrada,
sin free trial: código de invitación o compra. El webhook aprueba al
comprador con la misma marca (`stoicom_approved`) que usa el código.

## Configuración (una sola vez, ~20 min)

### 1. Cuenta y producto
1. Crea la cuenta en <https://lemonsqueezy.com> y tu store (StoiCom).
2. Products → New product: **"StoiCom Fundador"**, one-time payment,
   precio sugerido **$59 USD** (plan: limitado a los primeros 100).
3. Copia el **Buy link** del producto (Share → estilo
   `https://tu-store.lemonsqueezy.com/buy/xxxxxxxx`).

### 2. Variables en Vercel (y en `.env` local)
| Variable | Valor |
|---|---|
| `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL` | El buy link del producto |
| `LEMONSQUEEZY_WEBHOOK_SECRET` | El secret que definas en el paso 3 |

Redeploy después de agregarlas (la pública se incrusta en el build).

### 3. Webhook
Settings → Webhooks → nuevo:
- **Callback URL**: `https://stoic-mu.vercel.app/api/webhooks/lemonsqueezy`
- **Signing secret**: genera uno largo y aleatorio (el mismo de Vercel)
- **Events**: `order_created` (suficiente para pagos únicos)

### 4. Redirect tras el pago
En el producto → Confirmation modal / Redirect URL:
`https://stoic-mu.vercel.app/auth/verify`
(al volver, la página se recarga ya aprobada; si el webhook tarda unos
segundos, recargar de nuevo basta).

### 5. Prueba end-to-end (modo test)
Lemon Squeezy tiene **Test mode**: actívalo, usa la tarjeta
`4242 4242 4242 4242`, y verifica que:
1. El checkout abre con tu correo pre-llenado (viene de /auth/verify).
2. Al pagar, el webhook responde 200 (Settings → Webhooks → logs).
3. Tu usuario queda con `stoicom_plan: founder` y entra directo.
4. Llega el correo de bienvenida.
Luego desactiva test mode.

## Cómo fluye
1. Usuario entra con Google → `/auth/verify` (no aprobado).
2. Opción A: código → `/api/auth/verify-code` → aprobado.
   Opción B: botón "Hazte fundador" → checkout LS con
   `checkout[custom][user_id]=<uid>`.
3. LS confirma pago → webhook verifica firma HMAC → `app_metadata`:
   `stoicom_approved: true`, `stoicom_plan: 'founder'`,
   `stoicom_paid_at`, `stoicom_order` → bienvenida por correo.
4. El proxy deja pasar en la siguiente petición (lee el user fresco).

El panel `/admin` muestra la columna **Acceso** (fundador / código).

## Pendientes cuando haya planes recurrentes
- Webhooks `subscription_*` + `plan_expires_at` en app_metadata.
- Paywall por contenido (día >14) si se vuelve freemium.
- Customer portal para cancelar/cambiar plan.
