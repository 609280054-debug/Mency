from functools import lru_cache
from pathlib import Path
from dotenv import load_dotenv
import os

ROOT = Path(__file__).resolve().parents[1]
load_dotenv(ROOT / ".env")
ENV_PATH = ROOT / ".env"


class Settings:
    external_llm_base_url = os.getenv("EXTERNAL_LLM_BASE_URL", "https://api.deepseek.com")
    external_llm_api_key = os.getenv("EXTERNAL_LLM_API_KEY", "")
    external_llm_model = os.getenv("EXTERNAL_LLM_MODEL", "deepseek-v4-pro")


@lru_cache
def get_settings() -> Settings:
    return Settings()


def set_env_values(values: dict[str, str]) -> None:
    lines: list[str] = []
    if ENV_PATH.exists():
        lines = ENV_PATH.read_text(encoding="utf-8").splitlines()
    elif (ROOT / ".env.example").exists():
        lines = (ROOT / ".env.example").read_text(encoding="utf-8").splitlines()

    seen: set[str] = set()
    next_lines: list[str] = []
    for line in lines:
        if "=" not in line or line.strip().startswith("#"):
            next_lines.append(line)
            continue
        key = line.split("=", 1)[0].strip()
        if key in values:
            next_lines.append(f"{key}={values[key]}")
            seen.add(key)
        else:
            next_lines.append(line)

    for key, value in values.items():
        if key not in seen:
            next_lines.append(f"{key}={value}")

    ENV_PATH.write_text("\n".join(next_lines).rstrip() + "\n", encoding="utf-8")
    for key, value in values.items():
        os.environ[key] = value
    get_settings.cache_clear()
