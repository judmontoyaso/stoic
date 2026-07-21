# Captación de correos: lista + secuencia de 7 días

Embudo previo al pago. Un visitante deja su correo en la landing, confirma
(doble opt-in) y recibe los **7 primeros días reales** del track de
Comunicación, uno por día. El día 7 cierra con la oferta de fundador.

```
/landing → POST /api/leads/subscribe → correo de confirmación
        → GET /api/leads/confirm?token= → día 1 al instante
        → cron diario → días 2..7 → día 7 con CTA de compra
```

## Puesta en marcha

1. **Ejecutar `supabase_v9_leads.sql`** en el SQL Editor de Supabase
   (idempotente). Sin esta tabla el formulario responde error y el cron
   no envía nada — por diseño, no falla en silencio a medias.
2. Verificar en Vercel que estén `APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM`
   y `SUPABASE_SERVICE_ROLE_KEY`.
3. `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL` es **opcional**: si falta, el
   correo del día 7 no promete comprar nada, solo avisa de que el programa
   abre pronto. Es lo correcto mientras Lemon Squeezy siga sin verificar.

## Piezas

| Pieza | Archivo |
|---|---|
| Tabla y RLS | `supabase_v9_leads.sql` |
| Lógica compartida | `src/lib/leads.ts` |
| Plantillas de correo | `src/lib/email.ts` (`leadConfirmEmail`, `leadDripEmail`) |
| Alta | `src/app/api/leads/subscribe/route.ts` |
| Confirmación | `src/app/api/leads/confirm/route.ts` |
| Baja | `src/app/api/leads/unsubscribe/route.ts` |
| Cron de la secuencia | `src/app/api/cron/drip/route.ts` (incluido en `/api/cron/emails`) |
| Formulario | `src/components/LeadForm.tsx` |
| Página de estados | `src/app/suscripcion/page.tsx` |
| Métricas | `/admin` → tarjeta «Captación» |

## Decisiones que no son obvias

- **Doble opt-in.** Sin confirmación no sale ni un correo más. Protege la
  reputación del dominio y deja constancia del consentimiento.
- **La baja no ocurre en el GET.** El enlace del pie lleva a `/suscripcion`,
  donde hay que pulsar un botón (POST). Los escáneres corporativos de correo
  (Outlook Safe Links y similares) abren los enlaces por su cuenta: con un
  GET destructivo se darían de baja suscriptores que nunca lo pidieron.
- **El día 1 sale al confirmar**, no al día siguiente: esperar 24 h al cron
  enfriaría la intención justo cuando está más alta.
- **Tope de 40 envíos por pasada** y **30 altas nuevas por hora.** El plan
  gratuito de Resend tiene límite diario y los correos del programa (usuarios
  que ya pagaron) tienen prioridad sobre la captación.
- **Los leads no tienen zona horaria**, así que la secuencia sale a una hora
  fija (13:00 UTC): mañana en América, tarde en Europa.
- **RLS sin políticas.** Ni `anon` ni `authenticated` ven la tabla; todo pasa
  por las rutas con service role. La lista de correos no se filtra desde el
  navegador.

## Probar sin esperar un día

```bash
# Secuencia completa para un correo concreto (no consume su progreso)
curl "$APP_URL/api/cron/drip?secret=$CRON_SECRET&to=tu@correo.com&day=1"
curl "$APP_URL/api/cron/drip?secret=$CRON_SECRET&to=tu@correo.com&day=7"

# Pasada real (respeta hora, dedupe y topes)
curl "$APP_URL/api/cron/drip?secret=$CRON_SECRET"
```

`?to=` no marca nada: se puede repetir para previsualizar cualquier día.

## Métricas

`/admin` muestra capturados, confirmados, cuántos terminaron los 7 días,
conversiones y bajas, más el desglose por origen (`landing-hero` vs
`landing-footer`). Un lead se marca como convertido cuando ese mismo correo
entra por código de acceso o compra en Lemon Squeezy.

## Riesgos conocidos

- **Límite de Resend.** El plan gratuito topa alrededor de 50 correos al día
  entre programa y captación. Con 20-30 leads activos ya conviene pasar al
  plan de pago.
- **Sin CAPTCHA.** El freno es el tope de altas por hora. Si aparece abuso
  real, lo siguiente es Turnstile en el formulario.
- **Dominio.** Cuando llegue el dominio propio hay que reconfigurar SPF/DKIM
  en Resend y actualizar `APP_URL` y `EMAIL_FROM`, o los enlaces de
  confirmación seguirán apuntando al dominio de Vercel.
