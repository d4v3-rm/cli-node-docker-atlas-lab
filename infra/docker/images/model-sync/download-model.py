import json
import os
import shutil
from pathlib import Path

from huggingface_hub import snapshot_download


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def main() -> None:
    model_repo = require_env("MODEL_REPO")
    model_revision = require_env("MODEL_REVISION")
    model_target_dir = Path(require_env("MODEL_TARGET_DIR"))
    model_title = require_env("MODEL_TITLE")
    marker_path = model_target_dir / ".atlas-lab-model-ready.json"

    if marker_path.exists():
        marker = json.loads(marker_path.read_text(encoding="utf-8"))
        if marker.get("repo") == model_repo and marker.get("revision") == model_revision:
            print(f"Model '{model_title}' already present at {model_target_dir}")
            return

    if model_target_dir.exists():
        shutil.rmtree(model_target_dir)

    model_target_dir.mkdir(parents=True, exist_ok=True)

    print(f"Downloading model '{model_title}' from {model_repo}@{model_revision}")
    snapshot_download(
        repo_id=model_repo,
        revision=model_revision,
        local_dir=str(model_target_dir),
        local_dir_use_symlinks=False,
    )

    marker_path.write_text(
        json.dumps(
            {
                "repo": model_repo,
                "revision": model_revision,
                "title": model_title,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Model '{model_title}' staged at {model_target_dir}")


if __name__ == "__main__":
    main()
