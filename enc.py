
# ════════════════════
__ENC_AUTHOR__ = "STEIN"
__TELEGRAM__ = "@rejerk"
__GROUP_CHAT__ = "@keped"
# ════════════════════


import sys, urllib.request

URLS = {
    (3, 11): "https://raw.githubusercontent.com/stein-exe/hermit/refs/heads/main/files/3.11.py",
    (3, 12): "https://raw.githubusercontent.com/stein-exe/hermit/refs/heads/main/files/3.12.py",
    (3, 13): "https://raw.githubusercontent.com/stein-exe/hermit/refs/heads/main/files/3.13.py",
}

v = sys.version_info[:2]
url = URLS.get(v)

if not url:
    print(f"Unsupported Python version: {v[0]}.{v[1]}. Use 3.11, 3.12, or 3.13")
    sys.exit(1)

exec(urllib.request.urlopen(url).read().decode(), {'__name__': '__main__', '__file__': 'enc.py'})
