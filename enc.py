import sys
import urllib.request

major, minor = sys.version_info[:2]

url = (
    f"https://raw.githubusercontent.com/stein-exe/hermit/"
    f"refs/heads/main/files/{major}.{minor}.py"
)

try:
    code = urllib.request.urlopen(url).read().decode()
except Exception:
    print(
        f"Unsupported Python version: {major}.{minor} "
        f"(no matching file found)"
    )
    sys.exit(1)

exec(
    code,
    {
        "__name__": "__main__",
        "__file__": "enc.py",
    },
)
