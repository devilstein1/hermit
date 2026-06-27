<div align="center">

![Hermit Banner](https://i.ibb.co/sBWBFgD/a-professional-photograph-of-a-dark-hermit.jpg)

<br>

# 🧿 HERMIT 🧿

*The most powerful Python obfuscation engine*

<br>

[![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Cython](https://img.shields.io/badge/Cython-Powered-F7C948?style=for-the-badge&logo=cython&logoColor=black)](https://cython.org)
[![Termux](https://img.shields.io/badge/Termux-Only-1DBF73?style=for-the-badge&logo=android&logoColor=white)](#)
[![Free](https://img.shields.io/badge/Free-For%20Everyone-22C55E?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](#)
[![MIT License](https://img.shields.io/badge/License-MIT-22C55E?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](LICENSE)

</div>

---

## 📖 Overview

**Hermit** is the most powerful Python obfuscation engine, developed by **[Stein](https://t.me/rejerk)**

Hermit transforms Python source code into a highly secured, non-reversible format — making it **completely impossible** to retrieve the original logic. Built on top of **Python** and **Cython**, it compiles scripts into native binaries with advanced encryption layers on top.

> ✅ **Free for Everyone** — This project is completely free to use. No subscription or payment required!

**Obfuscated output runs on:**

| Platform | Architecture |
|----------|-------------|
| 🖥️ Windows | x64 |
| 🐧 Linux | x64 |
| 📱 Android | ARMv7 |
| 📱 Android | ARMv8 |

---

## 📦 Platform & Requirements

> [![Termux](https://img.shields.io/badge/Runs%20On-Termux-1DBF73?style=flat-square&logo=android&logoColor=white)](#)
> [![Python](https://img.shields.io/badge/Python-3.13-3776AB?style=flat-square&logo=python&logoColor=white)](#)

- Engine runs **only on Termux**
- Supports **Python 3.13 only**
- Obfuscated output runs on ARMv7, ARMv8, Windows, and Linux
- **Version-specific build** available in `/files` directory — `3.13.py`

---

## 🛠️ Installation

```bash
pkg update && pkg upgrade
pkg install git python -y
git clone https://github.com/devilstein1/hermit/
cd hermit
pip install -r requirements.txt
python enc.py req
python enc.py prefix
```

After running `prefix`, the `enc.py` command is available globally in Termux.

---

## 🚀 First Run

After installation, simply run:

```bash
steinenc
```

This will automatically download and execute the correct version file for your Python installation.

---

## ⚡ Global Command

Once `prefix` is set up, use `steinenc` from anywhere:

```bash
steinenc           # Auto-detects Python version and runs correct file
steinenc help      # Show all commands
steinenc bot       # Bot mode
steinenc site      # Web UI mode
steinenc settings  # Configure encryption layers
```

The `steinenc` command automatically:
- Verifies your Python version (3.13 required)
- Downloads the correct version file from GitHub
- Executes it with all features enabled

> No need to `cd` into the Hermit directory every time — just type `steinenc` anywhere in Termux!

---

## ⚙️ Usage

Hermit provides **4 modes** of operation. Run `steinenc --help` to see all available commands and options.

```bash
steinenc --help
```

---

### 1️⃣ Normal Mode

```bash
steinenc
# or
python enc.py
```

> Standard encryption flow — you select every option manually. Full control over which layers to apply and how.

📸 *Terminal Preview:*

![Normal Mode](https://github.com/devilstein1/hermit/blob/main/screenshots/Screenshot_20260309_155205_Termux.jpg)

---

### 2️⃣ Bot Mode

```bash
steinenc bot
# or
python enc.py bot
```

> Streamlined mode for **Telegram bots and automated scripts**. All encryption options are applied automatically — no manual configuration needed.

---

### 3️⃣ Site Mode ✨ `Recommended`

```bash
steinenc site
# or
python enc.py site
```

> The **most powerful and convenient** way to encrypt. Hermit launches a local web server — interact with the full encryption UI from any browser on your WiFi/LAN network.

- 🌐 Access via local IP on any connected device
- 🖥️ Full web interface for all options
- ⚡ Fastest workflow for repeated use

🎬 *Live Interface:*

![Site Mode](https://github.com/devilstein1/hermit/blob/main/screenshots/Screen_Recording_20260309_154200_Chrome.gif)

---

### 4️⃣ Bot Control Mode

```bash
steinenc bot_control
# or
python enc.py bot_control
```

> Control and manage Hermit remotely via a Telegram bot interface. Perfect for managing encryption jobs without direct terminal access.

---

## 📥 Download Version

Hermit requires **Python 3.13**. Download the version file from the `/files` directory:

| File | Python Version | Download |
|------|----------------|----------|
| `3.13.py` | Python 3.13 | [Raw](https://raw.githubusercontent.com/stein-exe/hermit/refs/heads/main/files/3.13.py) |

> 💡 **Pro Tip:** Just run `steinenc` and it will automatically download and execute the version file!

---

## 🔐 Encryption Features

| Feature | Description |
|---------|-------------|
| ⚡ **Speed** | 2–3× faster than standard Python execution |
| 🛡️ **Irreversible** | Zero chance of recovering the original source code |
| 🔒 **SteinCrypt** | Core obfuscation layer |
| 🔑 **STEINbest Strings** | String-level encryption |
| ✅ **Stability** | Almost zero runtime errors |

---

## ⚙️ Configuration

Encryption layers can be toggled in `settings.json`:

```json
{
  "steincrypt": true,
  "stein-best": true
}
```

> Set any option to `false` to disable that layer if compatibility issues arise.

You can also manage settings directly from the command line:

```bash
steinenc settings
# or
python enc.py settings
```

> Use this command to interactively view and change your `settings.json` options without editing the file manually.

---


## 📞 Contact

<div align="center">

[![Telegram](https://img.shields.io/badge/@rejerk-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/rejerk)
&nbsp;
[![Telegram Group](https://img.shields.io/badge/@keped%20%7C%20Group-26A5E4?style=for-the-badge&logo=telegram&logoColor=white)](https://t.me/keped)
&nbsp;
[![Instagram](https://img.shields.io/badge/@crying__kidz-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/crying_kidz)

</div>

---

## 📄 License

This project is licensed under the **MIT License** — free to use and distribute with proper credit to the original author. No one can modify this project.

---

## ⚠️ Disclaimer

This software is provided **strictly for educational purposes**. The author assumes **no responsibility** for misuse, malicious intent, or any consequences arising from the encrypted output.

---

<div align="center">

**STEIN · REJERK**

[![Telegram](https://img.shields.io/badge/Made%20by%20Stein-26A5E4?style=flat-square&logo=telegram&logoColor=white)](https://t.me/rejerk)

</div>
