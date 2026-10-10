"""
Módulo de Generación y Publicación en Reddit
Diseñado para distribución orgánica de alto valor y anti-spam en comunidades clave
(r/filosofia, r/desarrollopersonal, r/Productividad, r/stoicism).
"""

import os
import sys

if sys.stdout and hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

def create_reddit_discussion_post(
    day_number: int,
    lesson_title: str,
    lesson_core_idea: str,
    practical_exercise: str
) -> dict:
    """
    Crea un post estructurado en Reddit Markdown optimizado para engagement,
    debate honesto y cero spam.
    """
    title = f"Lo que aprendí practicando la regla de Séneca en conversaciones difíciles (Día {day_number}/90)"
    
    body = f"""He estado poniendo a prueba un principio del estoicismo aplicado a la comunicación durante situaciones de alta tensión: **{lesson_title}**.

### El problema habitual
La mayoría de nosotros reacciona de inmediato cuando nos sentimos juzgados o atacados. Saltamos a explicarnos, a justificarnos o a buscar la última palabra. Séneca decía que la ira y la defensividad no son señales de fuerza, sino de impotencia mental.

### La idea central
{lesson_core_idea}

### El ejercicio que puse en práctica hoy
{practical_exercise}

La primera vez que lo haces en frío es incómodo; el ego te pide intervenir. Pero cuando te obligas a guardar silencio y procesar antes de contestar, el balance de poder en la conversación cambia por completo.

---
**Pregunta para la comunidad:** ¿Qué técnica o hábito les ha servido a ustedes para no reaccionar en automático cuando alguien los confronta de mala fe?
"""

    comment_template = (
        "Para los que me preguntaron por privado: el ejercicio es parte de un programa "
        "de 90 días enfocado en comunicación estoica (los primeros 7 días son gratuitos en correo: stoicom.app)."
    )

    return {
        "title": title,
        "body": body,
        "recommended_subreddits": ["r/desarrollopersonal", "r/filosofia", "r/Productividad"],
        "followup_comment_template": comment_template
    }

def publish_or_save_reddit_post(post_data: dict, output_file: str, subreddit_name: str = "desarrollopersonal", dry_run: bool = True):
    """
    Publica en Reddit vía PRAW o guarda el borrador en Markdown para revisión.
    """
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(f"# TÍTULO: {post_data['title']}\n\n")
        f.write(f"Subreddits recomendados: {', '.join(post_data['recommended_subreddits'])}\n\n")
        f.write(f"## CUERPO:\n\n{post_data['body']}\n\n")
        f.write(f"---\n## COMENTARIO DE SEGUIMIENTO (Solo responder si preguntan):\n{post_data['followup_comment_template']}\n")

    print(f"📄 Post de Reddit preparado y guardado en: {output_file}")

    if not dry_run:
        client_id = os.getenv("REDDIT_CLIENT_ID")
        client_secret = os.getenv("REDDIT_CLIENT_SECRET")
        user_agent = os.getenv("REDDIT_USER_AGENT", "StoiComBot/1.0")
        username = os.getenv("REDDIT_USERNAME")
        password = os.getenv("REDDIT_PASSWORD")

        if client_id and client_secret and username and password:
            try:
                import praw
                reddit = praw.Reddit(
                    client_id=client_id,
                    client_secret=client_secret,
                    user_agent=user_agent,
                    username=username,
                    password=password
                )
                sub = reddit.subreddit(subreddit_name)
                submission = sub.submit(title=post_data['title'], selftext=post_data['body'])
                print(f"🚀 Post publicado en Reddit en vivo: https://reddit.com{submission.permalink}")
                return submission.permalink
            except Exception as e:
                print(f"⚠️ Error publicando en Reddit: {e}")
        else:
            print("💡 Credenciales de Reddit no configuradas. Ejecutado en modo DRY-RUN seguro.")
            
    return output_file

if __name__ == "__main__":
    post = create_reddit_discussion_post(
        day_number=1,
        lesson_title="Línea Base: Grábate 3 minutos hablando",
        lesson_core_idea="El diagnóstico más honesto es ver lo que el mundo ve y tú no: muletillas, postura y defensividad.",
        practical_exercise="Grábate 3 minutos sin preparar. Luego míralo 2 veces: primero solo audio para contar muletillas; luego sin volumen para ver tu lenguaje no verbal."
    )
    publish_or_save_reddit_post(post, "automation/output/reddit_post_day_1.md", dry_run=True)
