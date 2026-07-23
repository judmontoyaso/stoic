# Pagos con Mercado Pago (segunda puerta de fundador)

Rail de pago para **LatAm** (México + Colombia y demás): tarjeta, PSE, OXXO,
saldo. Convive con Lemon Squeezy (rail internacional/USD) y con el código de
invitación. Las tres puertas escriben la misma marca de aprobación
(`app_metadata.stoicom_approved`).

```
/auth/verify (usuario logueado) → POST /api/checkout/mercadopago
     → crea preferencia con external_reference = user_id → init_point
     → checkout de MP → pago aprobado
     → webhook /api/webhooks/mercadopago → verifica firma + consulta el pago
     → aprueba al usuario, bienvenida, marca lead convertido
```

## Puesta en marcha

1. **Cuenta de Mercado Pago** (la del fundador, país Colombia → cobra en COP).
   Panel de desarrolladores → crea una aplicación → copia el **Access Token**
   de producción.
2. **Webhook** en el panel de MP:
   - URL: `https://<app>/api/webhooks/mercadopago`
   - Evento: **Pagos** (`payment`)
   - Copia la **clave secreta** de la firma.
3. **Variables en Vercel** (todas server-side salvo la pública):

   | Variable | Ejemplo | Qué es |
   |---|---|---|
   | `MERCADOPAGO_ACCESS_TOKEN` | `APP_USR-...` | Token de producción. Secreto. |
   | `MERCADOPAGO_WEBHOOK_SECRET` | `abc123...` | Clave de la firma del webhook. |
   | `MERCADOPAGO_CURRENCY` | `COP` | Moneda de la cuenta. |
   | `MERCADOPAGO_FOUNDER_PRICE` | `199000` | Precio del fundador, en la moneda de arriba. |
   | `NEXT_PUBLIC_MERCADOPAGO_ENABLED` | `true` | Muestra el botón en `/auth/verify`. |

   **El botón solo aparece con `NEXT_PUBLIC_MERCADOPAGO_ENABLED=true`.** Estado
   seguro por defecto: sin ella no se vende por MP, igual que `LEMONSQUEEZY_LIVE`.

## Piezas

| Pieza | Archivo |
|---|---|
| Helpers (preferencia, pago, firma) | `src/lib/mercadopago.ts` |
| Crear preferencia (usuario logueado) | `src/app/api/checkout/mercadopago/route.ts` |
| Webhook | `src/app/api/webhooks/mercadopago/route.ts` |
| Botón | `src/app/auth/verify/page.tsx` |

## Decisiones que no son obvias

- **Preferencia dinámica, no URL estática.** LS usa una URL de checkout fija;
  MP necesita crear una *preferencia* por comprador para colgarle el `user_id`
  (`external_reference`). Por eso hay una ruta de backend además del webhook, y
  `/api/checkout/` está abierto en el proxy (valida la sesión dentro).
- **El estado del pago se consulta, no se cree.** El webhook solo trae el id;
  se hace `GET /v1/payments/{id}` y solo se aprueba si `status === 'approved'`.
  Una notificación falsa no puede aprobar a nadie.
- **Firma HMAC obligatoria.** Se valida el header `x-signature` contra el
  manifiesto `id:...;request-id:...;ts:...;`. Sin `MERCADOPAGO_WEBHOOK_SECRET`
  no se puede validar y se rechaza (401), nunca se procesa a ciegas.
- **La preferencia NO lleva `notification_url` a propósito.** Si se pone, MP
  manda una notificación IPN por esa URL que puede llegar **sin firmar**, y el
  webhook la rechaza (401) → el pago no aprueba la cuenta (nos pasó en la primera
  prueba real). Sin `notification_url`, MP usa solo el webhook del panel (Your
  integrations → app → Webhooks), que llega firmado y apunta al mismo endpoint.
- **404 vs error transitorio.** Si `GET /payments/{id}` da 404 (id inexistente,
  típico del simulador de MP) el webhook responde 200 para que MP no reintente en
  vano; si es un fallo transitorio (red, 5xx), responde 500 para que reintente.
- **Idempotente.** MP reintenta y manda varias notificaciones por pago. Aprobar
  dos veces es inofensivo; la bienvenida solo sale la primera (se mira si el
  usuario ya estaba aprobado).
- **Moneda y precio por env.** La cuenta de MP es de un país; cambiar de COP a
  MXN (o el precio) es configuración, no código.

## Límite conocido: pago desde el correo del día 7

El botón vive en `/auth/verify`, donde el usuario **ya inició sesión** y tiene
`user_id`. El correo del día 7 de la captación va a un lead que **aún no es
usuario**, así que ese enlace no puede crear una preferencia con `user_id`
(mismo hueco que ya tiene LS ahí). El camino limpio para un lead es: entra con
Google → llega a `/auth/verify` → paga. Cerrar el pago directo desde el correo
—casar por email tras la compra— queda pendiente para ambas pasarelas.

## Probar

No se puede probar de punta a punta sin credenciales reales de MP (el checkout
y la consulta del pago son remotos). Lo verificable sin cuenta:

- **Firma del webhook:** `src/lib/mercadopago.ts` → `verifyWebhookSignature`
  (probado con HMAC conocido: acepta la válida, rechaza manipulada/sin
  secreto/sin firma).
- **Degradación segura sin config:** checkout responde 503, webhook responde
  200 `ignored`, el botón no aparece.
- **Con config:** el webhook exige firma (401 sin ella).

Con la cuenta real, MP tiene **credenciales de prueba** (usuarios y tarjetas de
test) para simular una compra aprobada antes de pasar a producción.
