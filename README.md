# SecurePlugin VS Code Extension

## Overview
SecurePlugin enhances developer prompts, scans code for security issues using Semgrep, and suggests or applies secure fixes directly in VS Code.

## Features
- **Prompt Enrichment:** Appends secure coding requirements to developer prompts.
- **Security Scanning:** Runs Semgrep on file save or via command, detects hardcoded secrets, missing authorization, and outdated dependencies.
- **Diagnostics & Fixes:** Shows inline diagnostics, hover tooltips, and quick-fixes (e.g., replace hardcoded secrets with environment variables).
- **Rescan After Fix:** Automatically rescans after autofix to confirm resolution.

## Setup Instructions
1. Install [Semgrep](https://semgrep.dev/docs/getting-started/).
2. Clone this repo and open `/extension` in VS Code.
3. Run `npm install` in `/extension`.
4. Press `F5` to launch the extension in a new Extension Development Host.

## Example Usage & Demo Flow
1. **Prompt Enrichment:**
   - Run `SecurePlugin: Enrich Prompt` from Command Palette.
   - Type a prompt or add a comment like `// prompt: How to handle secrets?`.
   - See enriched prompt in info popup.
2. **Security Scan:**
   - Open `insecure.js` or `insecure.py`.
   - Save the file or run `Scan with SecurePlugin` from Command Palette.
   - Diagnostics appear for hardcoded secrets, missing authorization, or outdated dependencies.
3. **Apply Fix:**
   - Click the lightbulb or quick-fix for hardcoded secrets.
   - Fix is applied, Semgrep rescans, and issue is resolved.

## Example Insecure Code
See `insecure.js` and `insecure.py` for test cases.

## Custom Semgrep Rules
See `semgrep_rules/` for YAML rules used by the extension.

---

## Demo Script
1. Open VS Code and load `/extension`.
2. Show prompt enrichment (input box or inline comment).
3. Save file with insecure code (e.g., hardcoded secret).
4. Scanner detects issue and shows popup/inline fix.
5. Apply fix, rescan passes.

---

## Requirements
- VS Code ≥ 1.70
- Node.js ≥ 14
- Semgrep installed and in PATH
