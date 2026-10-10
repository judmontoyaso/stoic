"""
Servidor API Ligero (FastAPI) para recibir disparos automáticos desde n8n
Permite que tu servidor n8n active la renderización de video en tu GPU RTX 2050 local por Webhook.
"""

import sys
import uvicorn
from fastapi import FastAPI, BackgroundTasks
from pydantic import BaseModel
from pipeline import run_pipeline

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

app = FastAPI(title="StoiCom Local GPU Automation Server", version="1.0.0")

class PipelineRequest(BaseModel):
    day: int = 1
    mode: str = "all"
    use_veo: bool = False
    live: bool = False

@app.get("/health")
def health():
    return {
        "status": "online",
        "service": "stoicom-gpu-pipeline",
        "device": "NVIDIA GeForce RTX 2050 (NVENC)"
    }

@app.post("/run-pipeline")
def trigger_pipeline(req: PipelineRequest):
    results = run_pipeline(
        day=req.day,
        mode=req.mode,
        use_veo=req.use_veo,
        dry_run=not req.live
    )
    return {
        "status": "success",
        "day": req.day,
        "video_file": results.get("video"),
        "reddit_file": results.get("reddit")
    }

if __name__ == "__main__":
    print("🚀 Servidor Local StoiCom escuchando en http://localhost:8000 para n8n...")
    uvicorn.run(app, host="127.0.0.1", port=8000)
