# Changelog

All notable changes to **reflint for VS Code** are documented here.

## [0.1.0] — 2026-07-21

Initial public release.

- Underlines commands, scripts, and paths in `AGENTS.md` / `llms.txt` / `CLAUDE.md` that no longer exist, shown as **Warning** diagnostics in the editor.
- Runs on file open and save.
- Setting `reflint.codeBlocks` (bool) — also check bare paths inside fenced code blocks (`reflint --code-blocks`).
- Bundles [`@hyuga/reflint`](https://github.com/hyuga611/reflint) — no separate install required.
