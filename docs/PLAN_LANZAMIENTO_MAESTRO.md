# StoiCom — Plan Maestro de Lanzamiento y Aprobación Lemon Squeezy

> **Misión**: Convertir StoiCom en el referente hispanohablante de entrenamiento estoico de comunicación e influencia, combinando filosofía clásica con frameworks modernos de alto rendimiento (Robbins, Voss, Holiday, Clear, Brown, Martell), respaldado por un modelo de monetización de matrícula anual ($59 USD / $199.000 COP por 1 año de acceso completo sin auto-renovación) y un embudo de captación automatizado de 7 días.

---

## 🏛️ PILAR 1: Aprobación y Cumplimiento Lemon Squeezy (MoR)

Lemon Squeezy actúa como **Merchant of Record (MoR)** internacional. Para aprobar la tienda sin fricción ni retrasos, el sistema cumple al 100% con sus directrices regulatorias y de protección al comprador.

### 1.1 Borrador Oficial de Respuesta para el Review de Lemon Squeezy
*(Copiar y pegar directamente en el ticket o formulario de revisión de Lemon Squeezy)*

```markdown
Hi Lemon Squeezy Review Team,

Thank you for reviewing StoiCom. Here are the complete details requested for our store approval:

1. **Website & Legal URLs (Fully Live & Public):**
   - Main Store Landing: https://stoicom.app/landing
   - Terms of Service: https://stoicom.app/terms
   - Privacy Policy (GDPR / Statutory compliant): https://stoicom.app/privacy
   - Refund & Guarantee Policy (14-day 100% money-back): https://stoicom.app/reembolsos

2. **Customer Support Contact:**
   - Official Support Email: ayuda@stoicom.app (actively monitored with <24h SLA, also embedded in the footer of every daily email and application screen).

3. **Product Description:**
   - StoiCom is a comprehensive 90-day communication and emotional regulation training program in Spanish, based on applied Stoic philosophy and modern performance frameworks (Chris Voss, Tony Robbins, Julian Treasure, Carmine Gallo).
   - Features include:
     * 210 structured daily exercises across 3 tracks (Interpersonal Communication, Inner Mastery & Seneca Journal, Advanced Influence & Leadership).
     * Daily written lessons (400–550 words) delivered via morning email and within the web app.
     * Evening Seneca reflection journal with mood tracking.
     * 13 weekly behavioral challenges and monthly milestones.
     * Complete PWA installable on iOS, Android, and desktop.

4. **Transparent Pricing Breakdown:**
   | Tier | Price | Model | Description |
   |---|---|---|---|
   | Free Email Course | $0 USD | Free Lead Magnet | First 7 fundamental days of the program delivered via email |
   | Annual Enrollment Pass | $59 USD | One-time annual payment | 1 full year of complete access to all 3 tracks (210 daily lessons), Seneca night journal, weekly challenges, email delivery at custom user hour/timezone, and dashboard. Non-recurring / no auto-renewal. |

   *Note: Lemon Squeezy is our exclusive international merchant rail for USD transactions ($59 USD / year). We also provide Mercado Pago for localized Latin American domestic payment methods (COP $199,000 / year).*

5. **Demo Video Walkthrough (75 seconds):**
   - Video URL: [Insert Loom / YouTube Direct Link here]
   - The walkthrough demonstrates:
     a) Public landing page, pricing section with transparent currency toggle, and legal policies.
     b) Lemon Squeezy checkout initiation (`/auth/verify` -> LS hosted checkout with prefilled customer data).
     c) Authenticated dashboard, daily exercise view (`/today`), full reading display, and progress completion toggle.
     d) Seneca evening journaling module (`/journal`) with mood analytics.
     e) User preferences (`/settings`) for email schedule and timezone selection.

6. **Refund Guarantee Terms:**
   - Explicit 14-day unconditional money-back guarantee prominently displayed on the checkout flow, landing page, and refund policy page. Refunds are processed within 3-5 business days back to the original payment method.

Please let us know if any additional information or verification is required.

Best regards,
The StoiCom Team
```

### 1.2 Guion de Grabación del Video Demo (60–90 Segundos)
*Herramienta recomendada: Loom o Screen Studio con narración en inglés o subtítulos.*

| Segundo | Pantalla | Acción & Narración |
|---|---|---|
| **00:00 - 00:15** | `https://stoicom.app/landing` | Scroll suave mostrando el hero, la propuesta de valor, la sección de metodología ("Así se ve un día") y la sección de precios con el toggle USD ($59) / COP ($199.000). Mostrar links en el footer a Términos, Privacidad y Reembolsos. |
| **00:15 - 00:25** | `https://stoicom.app/auth/verify` | Demostrar las puertas de entrada. Clic en **"Inscribirme con Tarjeta Internacional"** → se abre el checkout seguro de Lemon Squeezy con el precio de $59 USD y el campo de email pre-llenado. |
| **00:25 - 00:40** | `https://stoicom.app/today` | Entrar con la cuenta de demostración aprobada. Mostrar la cita estoica del día, el ejercicio diario estructurado (ej. "Espejo táctico de Chris Voss"), y desplegar la lectura completa (400-500 palabras). Marcar el ejercicio como completado. |
| **00:40 - 00:55** | `https://stoicom.app/journal` | Abrir el examen nocturno de Séneca. Mostrar las tres preguntas estructuradas, la selección del estado de ánimo (1-5) y el guardado instantáneo con persistencia en Supabase. |
| **00:55 - 01:10** | `https://stoicom.app/calendar` & `/evaluation` | Mostrar el calendario honesto (días completados vs. días perdidos sin alteración de fechas) y el gráfico de correlación de ánimo. |
| **01:10 - 01:20** | `https://stoicom.app/settings` | Demostrar el selector de zona horaria y horario de recepción de correos matutinos. Cierre con mensaje de soporte en `ayuda@stoicom.app`. |

### 1.3 Checklist Técnico Previo al Pase a Producción en Lemon Squeezy
- [x] Webhook endpoint `/api/webhooks/lemonsqueezy` implementado con verificación de firma HMAC SHA-256 (`LEMONSQUEEZY_WEBHOOK_SECRET`).
- [x] Manejo automático de eventos `order_created`, `order_refunded`, y `order_updated`.
- [x] Acreditación instantánea de metadata de usuario (`stoicom_approved: true`, `stoicom_plan: 'founder'`).
- [x] Desactivación limpia y automática en caso de reembolso (`revokeAccess`).
- [x] Envío inmediato de correo transaccional de bienvenida (`welcomeEmail`) y registro en tabla `stoic.payments`.
- [ ] En Vercel: Configurar `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL`, `LEMONSQUEEZY_WEBHOOK_SECRET`, y `LEMONSQUEEZY_LIVE=true`.

---

## 🚀 PILAR 2: Estrategia de Lanzamiento — Programa Integral & Cohorte Ejecutiva

### 2.1 Propuesta de Valor y Retorno de Inversión (ROI)
- **Precio del Programa**: **$59 USD / año** (Internacional) / **$199.000 COP / año** (Colombia / LatAm), pago único por 12 meses sin renovación automática.
- **Anclaje de Valor**: Frente a consultorías ejecutivas de $500–$1.500 USD o másters tradicionales de oratoria, StoiCom entrega un sistema diario continuo de 210 prácticas por una fracción de la inversión, respaldado por garantía incondicional de 14 días.
- **Alcance del Programa**:
  1. 1 año de acceso completo a los 3 Tracks (210 prácticas diarias).
  2. Track Avanzado: *"Influencia & Liderazgo"* (30 días).
  3. Cero débitos automáticos: el usuario renueva de forma manual si desea continuar tras 12 meses.
  4. Diario de Séneca, métricas de progreso y soporte directo.

### 2.2 Cronograma de Lanzamiento en 7 Días

```
[Día -3 a -1] Pre-calentamiento & Convocatoria de Becas de Mérito (/becas)
     ↓
[Día 1] Apertura de Inscripciones para lista de espera & leads capturados (Email + Redes)
     ↓
[Día 2] Desglose público: "El video del Día 1 y por qué el 90% huye de él"
     ↓
[Día 3] Caso de Estudio: "Negociación bajo presión con el Espejo de Voss"
     ↓
[Día 4] Anuncio de los 20 Becarios de Mérito Seleccionados
     ↓
[Día 5] Enfoque en Retorno: "Por qué una habilidad de comunicación vale 10x tu inversión"
     ↓
[Día 6] Desglose del Examen Nocturno de Séneca & Maestría Emocional
     ↓
[Día 7] Cierre de Inscripciones de Cohorte ($59 USD / $199k COP + Garantía 14 Días)
```

### 2.3 Guiones de Publicación para Redes Sociales (Copywriting de Alta Conversión)

#### Copy para X (Twitter) & Threads (Hilo de Lanzamiento)
```text
1/ La mayoría de personas no tienen un problema de timidez. Tienen un problema de velocidad.

Aceleran al hablar porque temen perder el turno. Rellenan los silencios con muletillas porque el vacío les quema. Ceden en la conversación antes de que el otro argumente.

Hoy abrimos las inscripciones a StoiCom: 90 días de entrenamiento estoico de comunicación. 🧵👇

2/ No es un curso de vídeos que dejas a medias en una pestaña.

Es un sistema de entrenamiento diario:
- 6:00 AM: Recibes un ejercicio concreto con su lección táctica.
- Durante el día: Lo ejecutas en conversaciones reales.
- 8:00 PM: Examen nocturno de Séneca (3 preguntas, por escrito).

3/ El Día 1 empieza con una prueba incómoda: grabarte 3 minutos hablando sin preparar y escucharte dos veces.

Si te da pereza mirarte, la app no es para ti. Si quieres entrenar tu voz con la disciplina de Marco Aurelio y los frameworks de Chris Voss y Tony Robbins, bienvenido.

4/ Los primeros 7 días son 100% gratuitos por correo.

Para los que quieren el método completo durante un año entero (210 prácticas + 3 tracks), está disponible la Matrícula Anual ($59 USD / $199k COP, un solo pago por 12 meses sin débitos automáticos).

Pruébalo aquí: https://stoicom.app/landing
```

#### Copy para LinkedIn (Enfoque Profesional & Liderazgo Ejecutivo)
```text
En una junta directiva, la autoridad no se mide por quién habla más alto, sino por quién tolera mejor el silencio.

Durante años nos enseñaron que comunicar bien era tener carisma o hablar rápido. La realidad en las mesas de alta presión es otra:
• La regla 1-3-1 de Dan Martell para erradicar las quejas y llevar soluciones listas.
• El espejo táctico de Chris Voss para desarmar la tensión en 4 segundos.
• La disciplina del asentimiento de Marco Aurelio para no reaccionar desde el ego.

Hemos condensado estos principios en StoiCom: un programa diario de 90 días diseñado para profesionales, líderes y fundadores.

Un ejercicio al día. Sin teoría inflada.

Puedes hacer los primeros 7 días gratis en tu correo: https://stoicom.app/landing
```

---

## 📬 PILAR 3: Embudo de Conversión de 7 Días (Lead Drip Funnel)

El embudo automatizado convierte visitantes fríos en compradores comprometidos mediante valor diario de alto calibre y doble opt-in:

```
Visitante en Landing (/landing)
     ↓ [Formulario LeadForm]
POST /api/leads/subscribe
     ↓ [Correo con token seguro de doble opt-in]
GET /api/leads/confirm?token=...
     ↓ [Entrega inmediata del Día 1]
Cron Diario (/api/cron/drip a las 13:00 UTC)
     ├── Día 1: Diagnóstico y Video de Línea Base (Adrià Solà)
     ├── Día 2: Fisiología, Respiración 4-4-6 y la Pausa de 2 Segundos (Robbins/Treasure)
     ├── Día 3: Clasificación de Conversaciones: Práctica vs. Emocional (Duhigg)
     ├── Día 4: El Espejo Táctico y el Silencio de 4 Segundos (Chris Voss)
     ├── Día 5: Etiquetado Emocional y Auditoría de Acusaciones (Chris Voss)
     ├── Día 6: Claridad es Amabilidad: Poner Límites sin Disculpa (Brené Brown)
     └── Día 7: La Transición al Programa Completo ($59 USD / $199k COP + Garantía 14 Días)
```

### Regla Técnica de Activación de Venta:
El Día 7 evalúa la variable `LEMONSQUEEZY_LIVE=true` en Vercel. Si está activa, inserta el botón directo de compra a Lemon Squeezy / Mercado Pago. Si no está activa, mantiene la lista en modo calentamiento/pre-registro sin romper la experiencia.

---

## 🎓 PILAR 4: Programa de Becas de Mérito (`/becas`)

Para generar prueba social innegable y crear una comunidad inicial de practicantes de alto nivel, se crearon las **20 Becas de Mérito StoiCom**.

1. **Página pública**: `/becas` (manifiesto de disciplina y formulario de postulación).
2. **Criterio de Evaluación**: Compromiso con grabarse el Día 1 y ejecutar el examen nocturno de Séneca.
3. **Panel de Gestión**: `/admin/becas` para evaluar postulaciones con un solo clic y generar su código de matrícula anual automáticamente.
4. **Impacto Comunitario**: Cada becario seleccionado se compromete a compartir su progreso en la semana 4 y semana 12 en comunidades profesionales, generando validación orgánica.

---

## 🔄 PILAR 5: Bucles de Crecimiento Viral y Métricas Clave (KPIs)

### 5.1 Motor de Referidos Integrado (`/settings` & `/api/referidos`)
- Cada usuario aprobado recibe **códigos de invitación personalizados**.
- Mecánica: "Invita a un colega a entrenar juntos el reto semanal". Al compartir, se desbloquean hitos comunitarios en la plataforma.

### 5.2 Telemetría y Métricas Objetivo

| Métrica | Definición | Meta Saludable |
|---|---|---|
| **Tasa de Confirmación (DOI)** | Registros que confirman correo | > 75% |
| **Activación D1** | Usuarios que completan el Día 1 | > 65% |
| **Retención D7** | Usuarios activos en la lección 7 | > 45% |
| **Conversión Lead → Pago** | Suscriptores que adquieren el Programa Completo | > 3.5% |
| **Retención D30** | Usuarios que completan la Fase 1 (Percepción) | > 25% |
| **Tasa de Reembolso** | Reclamaciones dentro de los 14 días | < 2% |

---

## 📋 Resumen de Acciones para Salir a Producción

1. **Enviar borrador a Lemon Squeezy** con el texto del Pilar 1.1 y el enlace al video demo grabado.
2. **Verificar variables de entorno en Vercel**:
   - `NEXT_PUBLIC_LEMONSQUEEZY_CHECKOUT_URL` = URL del Buy Link de Lemon Squeezy.
   - `LEMONSQUEEZY_WEBHOOK_SECRET` = Secret generado en Lemon Squeezy Webhooks.
   - `LEMONSQUEEZY_LIVE` = `true` (una vez aprobada la tienda).
   - `APP_URL` = `https://stoicom.app`.
   - `RESEND_API_KEY` & `EMAIL_FROM` = `ayuda@stoicom.app` o remitente verificado.
   - `DEEPSEEK_API_KEY` / `OPENAI_API_KEY` para la generación de reflexiones IA.
3. **Publicar en redes sociales** el hilo de lanzamiento y la convocatoria de becas (`/becas`).
4. **Monitorear conversiones y aprobaciones** desde el panel `/admin`.
