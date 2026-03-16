import json
import os
import shutil
import tempfile
from pathlib import Path

from huggingface_hub import hf_hub_download, snapshot_download


def require_env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise RuntimeError(f"Missing required environment variable: {name}")
    return value


def require_mapping_value(mapping: dict, key: str) -> str:
    value = str(mapping.get(key, "")).strip()
    if not value:
        raise RuntimeError(f"Missing required model property: {key}")
    return value


def sync_single_file_model(
    model_repo: str,
    model_revision: str,
    model_title: str,
    model_filename: str,
    target_file: Path,
) -> None:
    marker_path = target_file.with_name(f".{target_file.name}.atlas-lab-model-ready.json")

    if marker_path.exists():
        marker = json.loads(marker_path.read_text(encoding="utf-8"))
        if (
            marker.get("repo") == model_repo
            and marker.get("revision") == model_revision
            and marker.get("filename") == model_filename
            and target_file.exists()
        ):
            print(f"Model '{model_title}' already present at {target_file}")
            return

    target_file.parent.mkdir(parents=True, exist_ok=True)
    print(f"Downloading model file '{model_filename}' from {model_repo}@{model_revision}")
    downloaded_file = hf_hub_download(
        repo_id=model_repo,
        filename=model_filename,
        revision=model_revision,
    )

    shutil.copyfile(downloaded_file, target_file)
    marker_path.write_text(
        json.dumps(
            {
                "repo": model_repo,
                "revision": model_revision,
                "filename": model_filename,
                "title": model_title,
            },
            indent=2,
        )
        + "\n",
        encoding="utf-8",
    )
    print(f"Model '{model_title}' staged at {target_file}")


def sync_snapshot_model(
    model_repo: str,
    model_revision: str,
    model_title: str,
    model_target_dir: Path,
) -> None:
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


def sync_vae_into_model_dir(
    source_repo: str,
    source_revision: str,
    model_title: str,
    model_target_dir: Path,
    source_subdir: str = "vae",
) -> None:
    marker_path = model_target_dir / ".atlas-lab-model-ready.json"
    marker = {}
    if marker_path.exists():
        marker = json.loads(marker_path.read_text(encoding="utf-8"))

    if (
        marker.get("vae_repo") == source_repo
        and marker.get("vae_revision") == source_revision
        and marker.get("vae_source_subdir") == source_subdir
        and marker.get("vae_added")
    ):
        print(f"VAE for model '{model_title}' already present at {model_target_dir / 'vae'}")
        return

    with tempfile.TemporaryDirectory(prefix="atlas-lab-vae-") as tmp_dir:
        source_path = Path(tmp_dir)
        print(f"Downloading VAE source '{source_subdir}' from {source_repo}@{source_revision}")
        snapshot_download(
            repo_id=source_repo,
            revision=source_revision,
            local_dir=str(source_path),
            local_dir_use_symlinks=False,
        )

        source_vae_dir = source_path / source_subdir
        if not source_vae_dir.exists():
            raise RuntimeError(f"Missing VAE source directory '{source_subdir}' in {source_repo}@{source_revision}")

        target_vae_dir = model_target_dir / "vae"
        if target_vae_dir.exists():
            shutil.rmtree(target_vae_dir)

        shutil.copytree(source_vae_dir, target_vae_dir)

    marker["vae_repo"] = source_repo
    marker["vae_revision"] = source_revision
    marker["vae_source_subdir"] = source_subdir
    marker["vae_added"] = True
    marker_path.write_text(
        json.dumps(marker, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"VAE for model '{model_title}' staged at {model_target_dir / 'vae'}")


def sync_model_definition(definition: dict) -> None:
    model_mode = str(definition.get("mode", "snapshot")).strip() or "snapshot"
    model_repo = require_mapping_value(definition, "repo")
    model_revision = require_mapping_value(definition, "revision")
    model_title = require_mapping_value(definition, "title")

    if model_mode == "snapshot_with_vae":
        sync_snapshot_model(
            model_repo=model_repo,
            model_revision=model_revision,
            model_title=model_title,
            model_target_dir=Path(require_mapping_value(definition, "target_dir")),
        )
        sync_vae_into_model_dir(
            source_repo=require_mapping_value(definition, "vae_repo"),
            source_revision=definition.get("vae_revision", model_revision).strip() or model_revision,
            model_title=model_title,
            model_target_dir=Path(require_mapping_value(definition, "target_dir")),
            source_subdir=definition.get("vae_source_subdir", "vae").strip() or "vae",
        )
        return

    if model_mode == "single_file":
        sync_single_file_model(
            model_repo=model_repo,
            model_revision=model_revision,
            model_title=model_title,
            model_filename=require_mapping_value(definition, "filename"),
            target_file=Path(require_mapping_value(definition, "target_file")),
        )
        return

    sync_snapshot_model(
        model_repo=model_repo,
        model_revision=model_revision,
        model_title=model_title,
        model_target_dir=Path(require_mapping_value(definition, "target_dir")),
    )


def sync_manifest(manifest_path: Path) -> None:
    if not manifest_path.exists():
        raise RuntimeError(f"Model manifest not found: {manifest_path}")

    payload = json.loads(manifest_path.read_text(encoding="utf-8"))
    definitions = payload.get("models", payload) if isinstance(payload, dict) else payload

    if not isinstance(definitions, list):
        raise RuntimeError("Model manifest must be a list or an object with a 'models' list")

    for definition in definitions:
        if not isinstance(definition, dict):
            raise RuntimeError("Each model manifest entry must be a JSON object")
        sync_model_definition(definition)


def main() -> None:
    manifest_path = os.environ.get("MODEL_MANIFEST_PATH", "").strip()
    if manifest_path:
        sync_manifest(Path(manifest_path))
        return

    sync_model_definition(
        {
            "mode": os.environ.get("MODEL_MODE", "snapshot").strip() or "snapshot",
            "repo": require_env("MODEL_REPO"),
            "revision": require_env("MODEL_REVISION"),
            "title": require_env("MODEL_TITLE"),
            "filename": os.environ.get("MODEL_FILENAME", "").strip(),
            "target_dir": os.environ.get("MODEL_TARGET_DIR", "").strip(),
            "target_file": os.environ.get("MODEL_TARGET_FILE", "").strip(),
        }
    )


if __name__ == "__main__":
    main()
