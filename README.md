<div align="center">

# 🛡️ CheckMate App

**Local SAST & Secret Exposure Intelligence Desktop Platform**


[![Release](https://img.shields.io/github/v/release/adedayo/checkmate-app?style=flat-square&color=06b6d4)](https://github.com/adedayo/checkmate-app/releases)
[![Docker](https://img.shields.io/badge/docker-ghcr.io%2Fadedayo%2Fcheckmate--app-blue?style=flat-square&logo=docker)](https://github.com/adedayo/checkmate-app/pkgs/container/checkmate-app)
[![License](https://img.shields.io/badge/license-BSD--3--Clause-emerald?style=flat-square)](LICENSE)

</div>

---

## 📌 Overview

**CheckMate App** is the native cross-platform desktop application for the CheckMate security ecosystem. Designed for security analysts, leads, and developers, it delivers a high-density, executive-level dashboard to analyze secret exposure posture across codebases, repositories, and organizational workspaces.

Unlike traditional flat security scanners, CheckMate App correlates findings across projects to identify **reused credentials**, classify **production vs. non-production leaks**, compute **highest-ROI remediation priorities**, and track **multi-scan posture trends**.

---

## ✨ Features

- 📊 **Executive & Analyst Dashboard**: Unified security posture rating (0–100%) with real-time workspace and environment filtering.
- 🤖 **Bring Your Own AI (BYO AI) Auto-Triage**: Connect local LLMs (Ollama) or cloud models (OpenAI, Anthropic, DeepSeek) for automated finding analysis, false positive likelihood scoring, and auto-suppression with persistent human-in-the-loop override memory.
- 🔑 **Cross-Project Reused Secrets Inventory**: Detects secret keys reused across multiple repositories to mitigate lateral movement risk.
- 🎯 **Highest ROI Remediation Playbook**: Ranks top 5 actions that yield the largest percentage reduction in exposure (e.g. rotating 1 reused secret key eliminates 14 leak instances).
- 🧪 **Production vs. Non-Production Risk Profiling**: Heuristically classifies leaks in live code vs. test suites, mocks, and fixtures.
- 📈 **Multi-Scan Posture Trends**: Custom interactive SVG trend charts tracking critical and high findings over historical scan executions.
- 🔄 **In-App Auto-Update Checking**: Built-in release detection that notifies analysts when a new version is available on GitHub Releases.

---

## 🤖 Bring Your Own AI (BYO AI) Auto-Triage & Auto-Suppression

CheckMate App includes a privacy-first **BYO AI Triage Engine** that eliminates alert fatigue without compromising code confidentiality.

### Key Capabilities
- **Multi-Provider Support:** Connect your choice of AI provider:
  - 🦙 **Ollama** (Local, air-gapped LLMs like `llama3`, `mistral`, `codellama` — zero code leaves your machine)
  - 🧠 **OpenAI** (`gpt-4o`, `gpt-4-turbo`)
  - 🤖 **Anthropic** (`claude-3-5-sonnet`, `claude-3-haiku`)
  - ⚡ **DeepSeek** (`deepseek-chat`, `deepseek-coder`)
  - 🔌 **Custom OpenAI-Compatible Endpoints** (vLLM, LocalAI, LM Studio)
- **Automated Triage & Confidence Thresholding:** Analyzes finding entropy, structural context, and code evidence. When a finding exceeds your configured confidence threshold (e.g., `fpLikelihood >= 80%`), CheckMate automatically creates an exception record and suppresses the finding.
- **Privacy & Prompt Redaction:** Choose between **`REDACTED`** mode (masks sensitive credentials before sending to LLM) or **`FULL`** context mode.
- **Human-in-the-Loop & Decision Memory:**
  - Analysts can view detailed AI annotations, confidence scores, and reasoning summaries in the finding detail drawer.
  - If an analyst marks a finding as **"True Positive"** or deletes an AI-generated suppression, CheckMate flags the finding with `UserOverridden = true`.
  - CheckMate's persistent database remembers your decision across future scan runs: **the AI engine will NEVER re-suppress a user-confirmed finding on subsequent scans**.

---

## 🚀 Quick Start & Installation

### 🍏 macOS (Apple Silicon & Intel)

#### Option 1: Homebrew Cask (Recommended)
```bash
brew install --cask adedayo/tap/checkmate-app
```

> [!NOTE]
> **macOS Gatekeeper Warning:** Because CheckMate App is a free open-source tool, it is not code-signed with a paid Apple Developer certificate. macOS Gatekeeper may show a "malware" or "cannot be opened" warning.
> To bypass this securely, run the following command in your terminal **after installation**:
> ```bash
> xattr -cr /Applications/CheckMate.app
> ```
> Alternatively, **Right-Click** the app in Finder and select **Open**.

#### Option 2: Direct Download
Download the latest `.dmg` or `.zip` release from [GitHub Releases](https://github.com/adedayo/checkmate-app/releases/latest).

---

### 🪟 Windows

#### Option 1: Native Installer
Download and run `CheckMate-amd64-installer.exe` from [GitHub Releases](https://github.com/adedayo/checkmate-app/releases/latest).

#### Option 2: Winget
```cmd
winget install adedayo.checkmate-app
```

---

### 🐧 Linux

Download the Linux package from [GitHub Releases](https://github.com/adedayo/checkmate-app/releases/latest):
```bash
# Extract the binary
tar -xzvf CheckMate-linux-amd64.tar.gz

# Run the app
./CheckMate
```

---

### 🐳 Docker Container (One-Liner Deployment)

Run CheckMate App in headless/web mode with a single command:

```bash
docker run -d \
  --name checkmate-app \
  -p 8080:8080 \
  -v ~/.checkmate:/root/.checkmate \
  ghcr.io/adedayo/checkmate-app:latest
```

Access the UI in your browser at `http://localhost:8080`.

#### Docker Compose
Alternatively, launch using Docker Compose:

```yaml
version: '3.8'
services:
  checkmate-app:
    image: ghcr.io/adedayo/checkmate-app:latest
    container_name: checkmate-app
    ports:
      - "8080:8080"
    volumes:
      - ~/.checkmate:/root/.checkmate
```

```bash
docker compose up -d
```

---

## 🔄 Auto-Update Mechanism

CheckMate App automatically checks the [GitHub Releases](https://api.github.com/repos/adedayo/checkmate-app/releases/latest) on startup. When a new release is published:

1. An **Update Ready Banner** appears at the top of the Executive Dashboard.
2. Displays the version jump (e.g., `v2.1.0` ➔ `v2.2.0`) and release notes summary.
3. Provides a 1-click **Get Update** button linking directly to the release package.

---

## 🛠️ Maintainer Release & Tagging Process

Automated multi-platform builds (macOS DMG, Windows EXE, Linux packages, Docker images) are governed by GitHub Actions (`.github/workflows/release.yml`).

To trigger an automated release:

```bash
# Run the automated release orchestration script
./scripts/release.sh v2.1.0
```

This script will:
1. Validate semver formatting (`v2.1.0`).
2. Update `AppVersion` in `app.go`.
3. Verify Angular frontend & Go backend compilation.
4. Commit the version bump and create a git tag (`v2.1.0`).
5. Push tag to `origin`, triggering the GitHub Actions matrix build.

---

## 💻 Local Development Setup

### Prerequisites
- **Go**: `1.24+`
- **Node.js**: `22+` & `npm`
- **Wails CLI**: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Running Development Server
```bash
# Clone checkmate-app repository
git clone https://github.com/adedayo/checkmate-app.git
cd checkmate-app

# Launch Wails development environment (Hot Reloading)
wails dev
```

---

## 📜 License

CheckMate App is open-source software licensed under the [BSD 3-Clause License](LICENSE).
