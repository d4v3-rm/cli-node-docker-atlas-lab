from __future__ import annotations

import argparse
import subprocess
import sys
import time
from pathlib import Path


REPO_ROOT = Path(__file__).resolve().parents[1]
ENV_FILE = REPO_ROOT / ".env"
GITEA_CONFIG = "/data/gitea/conf/app.ini"


def parse_env_file(path: Path) -> dict[str, str]:
    values: dict[str, str] = {}
    for raw_line in path.read_text(encoding="utf-8").splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        values[key.strip()] = value.strip()
    return values


def run(
    args: list[str],
    *,
    check: bool = True,
    capture_output: bool = False,
) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        args,
        cwd=REPO_ROOT,
        check=check,
        capture_output=capture_output,
        text=True,
    )


def compose(
    *args: str,
    check: bool = True,
    capture_output: bool = False,
) -> subprocess.CompletedProcess[str]:
    return run(["docker", "compose", *args], check=check, capture_output=capture_output)


def docker_inspect(container_id: str) -> str:
    result = run(
        [
            "docker",
            "inspect",
            "--format",
            "{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}",
            container_id,
        ],
        capture_output=True,
    )
    return result.stdout.strip()


def wait_for_service(service: str, timeout: int = 180) -> None:
    deadline = time.time() + timeout
    while time.time() < deadline:
        container_id = compose("ps", "-q", service, capture_output=True).stdout.strip()
        if container_id:
            state = docker_inspect(container_id)
            if state in {"healthy", "running"}:
                return
        time.sleep(2)
    raise RuntimeError(f"Timed out waiting for service '{service}' to become healthy")


def bootstrap_gitea(env: dict[str, str]) -> None:
    wait_for_service("gitea")

    base_cmd = [
        "docker",
        "compose",
        "exec",
        "-T",
        "--user",
        f"{env['GITEA_UID']}:{env['GITEA_GID']}",
        "gitea",
        "gitea",
        "admin",
        "user",
    ]

    listing = run(
        base_cmd + ["list", "--config", GITEA_CONFIG],
        capture_output=True,
    ).stdout

    if env["GITEA_ROOT_USERNAME"] in listing:
        run(
            base_cmd
            + [
                "change-password",
                "--config",
                GITEA_CONFIG,
                "--username",
                env["GITEA_ROOT_USERNAME"],
                "--password",
                env["GITEA_ROOT_PASSWORD"],
            ]
        )
        print("Gitea admin password updated.")
        return

    run(
        base_cmd
        + [
            "create",
            "--config",
            GITEA_CONFIG,
            "--username",
            env["GITEA_ROOT_USERNAME"],
            "--password",
            env["GITEA_ROOT_PASSWORD"],
            "--email",
            env["GITEA_ROOT_EMAIL"],
            "--admin",
            "--must-change-password=false",
        ]
    )
    print("Gitea admin user created.")


def bootstrap_ollama(env: dict[str, str]) -> None:
    wait_for_service("ollama")
    model = env["OLLAMA_EMBEDDING_MODEL"]

    exists = compose(
        "exec",
        "-T",
        "ollama",
        "ollama",
        "show",
        model,
        check=False,
        capture_output=True,
    )

    if exists.returncode == 0:
        print(f"Ollama model already present: {model}")
        return

    compose("exec", "-T", "ollama", "ollama", "pull", model)
    print(f"Ollama model pulled: {model}")


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Idempotent bootstrap for the local lab stack."
    )
    parser.add_argument(
        "--skip-gitea",
        action="store_true",
        help="Skip the Gitea admin bootstrap step.",
    )
    parser.add_argument(
        "--skip-ollama",
        action="store_true",
        help="Skip the Ollama embedding model bootstrap step.",
    )
    args = parser.parse_args()

    env = parse_env_file(ENV_FILE)

    if not args.skip_gitea:
        bootstrap_gitea(env)

    if not args.skip_ollama:
        bootstrap_ollama(env)

    return 0


if __name__ == "__main__":
    sys.exit(main())
