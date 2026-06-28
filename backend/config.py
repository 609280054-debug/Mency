import os
import shutil
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[1]
CONFIG_DIR = Path(os.getenv("MENCY_CONFIG_DIR", ROOT))
CONFIG_DIR.mkdir(parents=True, exist_ok=True)
ENV_PATH = CONFIG_DIR / ".env"
EXAMPLE_PATH = ROOT / ".env.example"

if not ENV_PATH.exists() and EXAMPLE_PATH.exists():
    shutil.copyfile(EXAMPLE_PATH, ENV_PATH)

load_dotenv(ENV_PATH, override=True)


class Settings:
    def __init__(self) -> None:
        self.external_llm_base_url = os.getenv("EXTERNAL_LLM_BASE_URL", "https://api.deepseek.com")
        self.external_llm_api_key = os.getenv("EXTERNAL_LLM_API_KEY", "")
        self.external_llm_model = os.getenv("EXTERNAL_LLM_MODEL", "deepseek-v4-pro")
        self.env_path = str(ENV_PATH)


@lru_cache
def get_settings() -> Settings:
    return Settings()


def set_env_values(values: dict[str, str]) -> None:
    lines: list[str] = []
    if ENV_PATH.exists():
        lines = ENV_PATH.read_text(encoding="utf-8").splitlines()
    elif EXAMPLE_PATH.exists():
        lines = EXAMPLE_PATH.read_text(encoding="utf-8").splitlines()

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
