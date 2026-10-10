"""
Lector de lecciones reales de StoiCom desde el seed SQL del track Comunicación.
Devuelve {day_number: {title, instructions, rationale, source_author, module, week}}.
"""

import os
import re

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SEED_FILE = os.path.join(ROOT, "supabase_v2_seed_comunicacion.sql")

_Q = r"'((?:[^']|'')*)'"
_TUPLE = re.compile(
    r"\(\s*(\d+),\s*(\d+),\s*(\d+),\s*" + _Q + r",\s*" + _Q + r",\s*" + _Q + r",\s*" + _Q + r",\s*" + _Q + r"\s*\)"
)


def _unq(s: str) -> str:
    return s.replace("''", "'").strip()


def load_lessons(seed_file: str = SEED_FILE) -> dict:
    text = open(seed_file, encoding="utf-8").read()
    start = text.find("INSERT INTO stoic.program_days")
    if start == -1:
        raise ValueError("No se encontró el bloque program_days en el seed")
    end = text.find("ON CONFLICT", start)
    block = text[start:end if end != -1 else len(text)]

    lessons = {}
    for m in _TUPLE.finditer(block):
        day, phase, week, module, title, instr, rationale, author = m.groups()
        day = int(day)
        if day in lessons:
            continue
        lessons[day] = {
            "day": day,
            "week": int(week),
            "module": _unq(module),
            "title": _unq(title),
            "instructions": _unq(instr),
            "rationale": _unq(rationale),
            "source_author": _unq(author),
        }
    return lessons


if __name__ == "__main__":
    import sys
    if sys.stdout and hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
    ls = load_lessons()
    print(f"{len(ls)} lecciones cargadas")
    for d in range(1, 11):
        print(d, "-", ls[d]["title"], "|", ls[d]["source_author"])
