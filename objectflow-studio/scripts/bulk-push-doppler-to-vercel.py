"""One-time bulk push: Doppler dev config -> Vercel project, all 3 environments.

Why this exists: the Doppler -> Vercel integration was configured but never
fired its initial sync. Rather than fight Doppler's UI, we seed Vercel with
the current values now so the deploy can proceed. The integration itself
remains in place and should pick up future rotations automatically.

Safety:
- Secret values flow Doppler stdout -> Python in-memory -> Vercel CLI stdin.
  Nothing lands on disk, nothing lands in argv, nothing prints to the
  console. The only thing logged is variable names + status.
- Uses --force so this is idempotent: re-running replaces values.
- Uses --sensitive (Vercel's default) so values can't be read back via
  vercel env ls / pull.

Usage:
  cd objectflow-studio
  doppler run -- python scripts/bulk-push-doppler-to-vercel.py
    (doppler run isn't strictly required since we shell out to doppler
    secrets directly, but it confirms the user's intent + Doppler context)
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path

# Names we deliberately do NOT push to Vercel:
# - DOPPLER_* are Doppler's own runtime markers, not real app secrets
# - LANGFUSE_DEBUG is dev-only verbosity; production doesn't need it
SKIP_PREFIXES = ("DOPPLER_",)
SKIP_EXACT = {"LANGFUSE_DEBUG"}

VERCEL_ENVIRONMENTS = ("production", "preview", "development")

# Allow restricting to a subset via env var when retrying just the failed envs:
# ONLY_ENVS="preview,development" python scripts/bulk-push-doppler-to-vercel.py
import os as _os
_only = _os.environ.get("ONLY_ENVS")
if _only:
    VERCEL_ENVIRONMENTS = tuple(e.strip() for e in _only.split(","))


def find_doppler() -> str:
    """Locate the Doppler CLI. Falls back to a known WinGet path on Windows."""
    found = shutil.which("doppler")
    if found:
        return found
    winget_path = Path(
        r"C:\Users\blued\AppData\Local\Microsoft\WinGet\Packages"
        r"\Doppler.doppler_Microsoft.Winget.Source_8wekyb3d8bbwe\doppler.exe"
    )
    if winget_path.exists():
        return str(winget_path)
    sys.exit("doppler CLI not found on PATH or at known WinGet path")


def find_vercel() -> list[str]:
    """Locate the Vercel CLI. Workspace install means pnpm exec is reliable."""
    # `pnpm exec vercel` resolves the local devDep
    pnpm = shutil.which("pnpm")
    if pnpm:
        return [pnpm, "exec", "vercel"]
    vercel = shutil.which("vercel")
    if vercel:
        return [vercel]
    sys.exit("Neither pnpm nor vercel found on PATH")


def fetch_doppler_secrets(doppler_bin: str) -> dict[str, str]:
    """Pull all Doppler secrets for the current configured context as JSON."""
    proc = subprocess.run(
        [doppler_bin, "secrets", "download", "--no-file", "--format", "json"],
        capture_output=True,
        text=True,
        check=False,
    )
    if proc.returncode != 0:
        sys.exit(f"doppler secrets download failed:\n{proc.stderr}")
    data = json.loads(proc.stdout)
    return {k: v for k, v in data.items()
            if not k.startswith(SKIP_PREFIXES) and k not in SKIP_EXACT}


def push_one(vercel_cmd: list[str], name: str, value: str, env: str) -> bool:
    """Pipe a single value into `vercel env add NAME env --force --sensitive --yes`.

    --yes is required for preview/development to suppress the "which git
    branch?" prompt; without it Vercel exits 1 with status=action_required.
    With --yes, the var applies to ALL branches in that environment, which
    is what we want for the seed push.
    """
    # --force overrides existing; --sensitive (default) makes the value
    # unreadable after upload. --yes accepts all branch defaults.
    # Pass value via stdin so it never hits argv.
    proc = subprocess.run(
        [*vercel_cmd, "env", "add", name, env, "--force", "--sensitive", "--yes"],
        input=value,
        text=True,
        capture_output=True,
    )
    if proc.returncode != 0:
        # Don't print value; only the error text.
        print(f"  {env:11s} FAIL: {proc.stderr.strip().splitlines()[-1] if proc.stderr else 'unknown'}")
        return False
    return True


def main() -> int:
    doppler_bin = find_doppler()
    vercel_cmd = find_vercel()

    print("Fetching secrets from Doppler...")
    secrets = fetch_doppler_secrets(doppler_bin)
    print(f"Got {len(secrets)} secrets to push (across {len(VERCEL_ENVIRONMENTS)} Vercel envs each).\n")

    successes = 0
    failures = 0
    for name in sorted(secrets):
        value = secrets[name]
        print(f"{name}")
        for env in VERCEL_ENVIRONMENTS:
            ok = push_one(vercel_cmd, name, value, env)
            if ok:
                print(f"  {env:11s} ok")
                successes += 1
            else:
                failures += 1

    print(f"\nDone. {successes} writes succeeded, {failures} failed.")
    return 0 if failures == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
