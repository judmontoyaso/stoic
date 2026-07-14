# StoiCom — Plan para convertirla en app de pago

> Estado actual: PWA funcional multi-usuario (Google + código de acceso), programa de 90 días
> en 2 tracks, correos diarios personalizados, push, diario estoico, evaluación con IA.
> Costo operativo actual: ~$0 (Vercel Hobby, Supabase Free, Resend Free, DeepSeek centavos).

---

## 1. ¿Cuánto pagarían? (benchmark real del mercado)

| App | Qué ofrece | Precio |
|---|---|---|
| Stoic (iOS) | Journaling estoico + rutinas | $3.99 USD/mes · $27.99/año |
| Waking Up | Meditación/filosofía | $99 USD/año |
| Headspace | Meditación | $12.99 USD/mes · $69.99/año |
| Fabulous | Hábitos con programa guiado | $39.99 USD/año |
| Habitica / Streaks | Hábitos simples | $0–5 USD único |
| Journey / Day One | Diario | $2.5–4 USD/mes |

**Dónde encaja StoiCom**: entre "Stoic" y "Fabulous" — programa guiado con fecha real +
journaling + coaching IA diario por correo. El correo diario personalizado con lección IA
es el diferenciador (nadie del benchmark lo hace bien en español).

**Precio recomendado (mercado LATAM + España):**

- **Freemium**: gratis = 14 primeros días del programa + diario básico. De ahí, paywall.
- **Mensual**: **$4.99 USD / ~20.000 COP**
- **Anual**: **$29.99 USD / ~120.000 COP** (equivale a $2.5/mes — ancla la decisión)
- **Fundador (lifetime)**: $59 USD única vez, limitado a primeros 100 usuarios — caja
  temprana y evangelistas.

Regla de sanidad: el programa dura 90 días → el usuario racional compara "3 meses × $4.99 =
$15" contra un curso de comunicación de $100+. Percepción de valor alta si el contenido
diario se siente hecho a mano.

---

## 2. Qué falta técnicamente (en orden)

### 2.1 Pagos — Stripe (1-2 semanas)
- [ ] Cuenta Stripe + productos (mensual/anual/lifetime). En Colombia: Stripe vía cuenta USD
      (Payoneer/Wise) o alternativa **Lemon Squeezy** (merchant of record: ellos facturan,
      liquidan impuestos internacionales, aceptan PayPal — menos fricción legal, fee 5%+).
      Para LATAM considerar también **Mercado Pago** (PSE/Nequi vía checkout propio).
- [ ] Webhook `/api/webhooks/stripe`: en `checkout.session.completed` marcar
      `app_metadata.plan = 'pro'` + `plan_expires_at` (mismo patrón que `stoicom_approved`).
- [ ] Paywall: proxy ya valida usuario; añadir check de plan en las rutas de programa
      (día >14 requiere pro). El contenido está en DB → paywall = filtro en RLS o en query.
- [ ] Portal de cliente (cancelar/cambiar plan): Stripe Customer Portal, un link.

### 2.2 Onboarding sin fricción (1 semana)
- [ ] Eliminar el código de acceso para nuevos usuarios de pago: el código fue diseño de
      "app privada". Nuevo flujo: Google → trial 14 días automático (`app_metadata.trial_started_at`).
- [ ] Pantalla de bienvenida: elegir track(s), fecha de inicio, hora de correos.
- [ ] Preferencias por usuario: hora de correo matutino/nocturno, timezone (hoy fijo Bogotá).

### 2.3 Robustez multi-usuario (1 semana)
- [ ] Push subscriptions por usuario (hoy globales — con N usuarios el push nocturno
      revela datos del primero).
- [ ] Rate limit al endpoint de verificación y a daily-reading (costo IA).
- [ ] Colas para correos: >50 usuarios, el loop secuencial del cron excede timeout →
      n8n puede paginar (`?offset=`) o migrar a Supabase Edge Functions + cron propio.
- [ ] Emails transaccionales con dominio propio verificado en Resend (deliverability):
      dominio ~$12/año. Resend Free = 100 correos/día → con 2 correos/usuario/día,
      tope 50 usuarios; plan Pro $20/mes = 50k/mes.

### 2.4 Legal (antes de cobrar)
- [ ] Términos de servicio + Política de privacidad (páginas estáticas).
- [ ] Tratamiento de datos personales (Ley 1581 Colombia / GDPR si vendes a Europa).
- [ ] RUT/actividad económica para facturar; si Lemon Squeezy, ellos son el vendedor.

---

## 3. Promoción y captación (presupuesto ~$0)

**Posicionamiento**: "El programa de 90 días que entrena cómo hablas — con los demás y
contigo mismo. Filosofía estoica aplicada, un ejercicio al día, sin trampas."

### Canales orgánicos (validación, meses 1-3)
1. **TikTok/Reels/Shorts en español**: el nicho estoicismo es enorme y la mayoría es
   contenido genérico de frases. Diferenciador: mostrar EL ejercicio del día real de la app
   ("Día 5: auditoría de lenguaje corporal — así se hace"). 3-5 videos/semana. El contenido
   ya existe: 180 ejercicios escritos = 180 guiones.
2. **Build in public en X/LinkedIn**: métricas reales, decisiones de producto. LinkedIn
   además vende el track de comunicación a profesionales (el que paga).
3. **Newsletter gratuita semanal** (Substack o el propio Resend): 1 lección estoica gratis →
   funnel a la app. El correo diario ya está escrito, reciclar.
4. **Comunidades**: r/Estoicismo, r/desarrollopersonal, grupos de Telegram/Discord de
   productividad en español. Aportar, no spamear.
5. **Product Hunt / directorios PWA**: un pico de tráfico anglo; la app necesitaría i18n
   inglés para aprovecharlo (fase 2).

### De pago (solo tras validar conversión orgánica)
- Meta/TikTok ads a landing con trial. No antes de tener conversión trial→pago medida.

### Loop de referidos
- "Regala 1 mes a un amigo, gana 1 mes": el programa se hace mejor acompañado —
  reto semanal compartido es feature social natural (fase 2).

---

## 4. Métricas que deciden todo

| Métrica | Objetivo sano |
|---|---|
| Activación (inicia track + completa día 1) | > 60% de registros |
| Retención D7 | > 40% |
| Retención D30 | > 20% |
| Conversión trial → pago | 2–5% (freemium), 8–15% (trial forzado) |
| Churn mensual | < 8% |

Instrumentación mínima: PostHog (free tier) o eventos a una tabla `stoic.events`.

**Matemática de servilleta**: 10.000 visitas → ~10% registro (1.000) → 60% activan (600)
→ 4% pagan (24) → 24 × $4.99 = **~$120 USD/mes por cada 10k visitas**. El negocio está en
subir conversión con el correo diario (el hook real) y en el plan anual.

---

## 5. Costos a escala

| Usuarios pagos | Vercel | Supabase | Resend | IA (DeepSeek) | Total/mes | Ingreso (4.99) |
|---|---|---|---|---|---|---|
| 10 | $0 | $0 | $0 | ~$1 | ~$1 | $50 |
| 100 | $20 (Pro) | $25 (Pro) | $20 | ~$5 | ~$70 | $499 |
| 1.000 | $20 | $25 | $20 | ~$40 | ~$105 | $4.990 |

Margen bruto >90% desde 100 usuarios. El costo real es tu tiempo + contenido.

---

## 6. Hoja de ruta sugerida

| Semana | Entregable |
|---|---|
| 1-2 | Pagos (Lemon Squeezy o Stripe) + paywall día 15 + términos/privacidad |
| 3 | Onboarding (track, fecha, hora de correo) + preferencias por usuario |
| 4 | Dominio propio + correo con dominio verificado + PostHog |
| 5-8 | Contenido TikTok/LinkedIn diario + newsletter + 20 usuarios beta pagando precio fundador |
| 9-12 | Iterar con datos: pricing, paywall, retención. Decidir si i18n inglés |

**Criterio de validación**: 20 personas pagando el precio fundador en 60 días.
Si no llegan, el problema es distribución o propuesta — no construir más features.
