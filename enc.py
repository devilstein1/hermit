# ════════════════════
__ENC_AUTHOR__ = "STEIN"
__TELEGRAM__ = "@rejerk"
__GROUP_CHAT__ = "@keped"
# ════════════════════


import sys
import urllib.request
from pathlib import Path

v = sys.version_info[:2]
version = f"{v[0]}.{v[1]}"

files_dir = Path("files")
files_dir.mkdir(exist_ok=True)

local_file = files_dir / f"{version}.py"

if not local_file.exists():
    url = f"https://raw.githubusercontent.com/stein-exe/hermit/refs/heads/main/files/{version}.py"

    try:
        local_file.write_bytes(
            urllib.request.urlopen(url).read()
        )
    except Exception:
        print(f"Unsupported Python version: {version}")
        sys.exit(1)

exec(
    local_file.read_text(encoding="utf-8"),
    {
        "__name__": "__main__",
        "__file__": str(local_file)
    }
)
