from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
BOOTSTRAP_SCRIPT = REPO_ROOT / "scripts" / "bootstrap_lab.py"
LEGACY_IMAGES = ("cli-node-lab-ollama-init:latest",)


def run(args: list[str]) -> None:
    subprocess.run(args, cwd=REPO_ROOT, check=True)


def cleanup_legacy_images() -> None:
    for image in LEGACY_IMAGES:
        subprocess.run(
            ["docker", "image", "rm", "-f", image],
            cwd=REPO_ROOT,
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Start the lab stack and run the idempotent bootstrap."
    )
    parser.add_argument(
        "--build",
        action="store_true",
        help="Rebuild images before starting the stack.",
    )
    parser.add_argument(
        "--with-workbench",
        action="store_true",
        help="Start the optional workbench profile too.",
    )
    args = parser.parse_args()

    compose_cmd = ["docker", "compose"]
    if args.with_workbench:
        compose_cmd += ["--profile", "workbench"]
    compose_cmd += ["up", "-d", "--remove-orphans"]
    if args.build:
        compose_cmd.append("--build")

    print("Starting the lab stack with Docker Compose...", flush=True)
    run(compose_cmd)
    print("Running the idempotent Python bootstrap...", flush=True)
    run([sys.executable, str(BOOTSTRAP_SCRIPT)])
    print("Cleaning legacy init images, if any...", flush=True)
    cleanup_legacy_images()
    print("Lab stack ready.", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
