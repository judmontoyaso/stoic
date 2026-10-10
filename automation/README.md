# StoiCom — Motor de Automatización y Distribución Audiovisual

Sistema integral para la generación y distribución de videos verticales (9:16) y publicaciones en Reddit basadas en el programa de 90 días de **StoiCom**.

---

## ⚡ Componentes Integrados

1. **Locución y TTS (`audio_tts.py`)**:
   - Integración nativa con **ElevenLabs API** (`eleven_multilingual_v2`).
   - Conmutación por error (*fallback*) automático a **Edge-TTS** (`es-ES-AlvaroNeural` o `es-CO-GonzaloNeural`) a **$0 USD ilimitado**.
   - Generación de subtítulos dinámicos (`.ass` y `.srt`) en oro y blanco con tipografía cinematográfica.

2. **Renderizado de Video Local (`video_composer.py`)**:
   - Ensamblado mediante **FFmpeg** utilizando aceleración por hardware **NVENC** en tu GPU **NVIDIA GeForce RTX 2050**.
   - Exportación nativa en formato vertical 9:16 (1080x1920) a 30fps en menos de 10 segundos.

3. **Generación con Google Veo (`veo_generator.py`)**:
   - Conexión oficial mediante el SDK `google-genai` para el modelo **Veo 3.1** de Google DeepMind.
   - Genera clips cinematográficos de estatuas de mármol, claroscuro y partículas flotantes.
   - Alternativa incluida: Descarga de B-roll de alta resolución vía Pexels API o fondo de claroscuro procedural.

4. **Distribución en Reddit (`reddit_distributor.py`)**:
   - Formateo de posts de discusión psicológica y filosófica orientados a engagement orgánico (cero spam).
   - Compatible con **PRAW** para publicación desatendida.

5. **Servidor Webhook Local (`server.py`) & n8n**:
   - Servidor FastAPI que expone `POST /run-pipeline` en `http://localhost:8000`.
   - Workflow importable para n8n en `n8n/distribution-pipeline.workflow.json`.

---

## 🚀 Cómo Ejecutarlo

### 1. Ejecución Manual por Terminal (CLI)
```bash
# Probar Día 1 (Video + Reddit)
py automation/pipeline.py --day 1

# Probar solo video con Google Veo
py automation/pipeline.py --day 1 --mode video --veo

# Probar solo post de Reddit
py automation/pipeline.py --day 2 --mode reddit
```

### 2. Ejecutar Servidor para n8n
```bash
py automation/server.py
```

### 3. Conectar en n8n
1. Abre tu servidor de n8n.
2. Haz clic en **Import from File** y selecciona `n8n/distribution-pipeline.workflow.json`.
3. Activa el trigger cron para distribución semanal automática.

---

## 🔑 Variables de Entorno Opcionales (`.env`)

Copia `automation/.env.example` a `automation/.env`:
- `GEMINI_API_KEY`: Para Google Veo y Gemini 2.0 Flash.
- `ELEVENLABS_API_KEY`: Para locución ultra-realista de ElevenLabs.
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_USERNAME`, `REDDIT_PASSWORD`: Para publicación automática en Reddit.
- `PEXELS_API_KEY`: Para descarga automática de B-Roll gratuito de archivo.
