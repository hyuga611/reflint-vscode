# reflint for VS Code

Underlines commands, scripts, and paths in your **`AGENTS.md` / `llms.txt` / `CLAUDE.md`** that no longer exist — right in the editor, as you save. Powered by [reflint](https://github.com/hyuga611/reflint).

`AGENTS.md` などの中の「もう存在しないコマンド・パス」を、保存のたびにエディタ上で波線表示します。CI（reflint本体）で毎PR落とす前に、書いている最中に気づけます。

## How it works

The extension runs `reflint --format json` on the file and turns each finding into a VS Code **Warning** diagnostic. That's it — the linting logic lives in reflint; this is a thin editor layer over its machine-readable output.

- Targets: files named `AGENTS.md`, `llms.txt`, `CLAUDE.md`
- Runs on: open + save
- Setting: `reflint.codeBlocks` (bool) — also check bare paths inside fenced code blocks

## Requirements

`@hyuga/reflint` is bundled as a dependency, so no separate install is needed. Node ships with VS Code.

## Install

From the VS Code Marketplace — search **"reflint"** in the Extensions view, or:

```bash
code --install-extension hyuga611.reflint-vscode
```

Also on [Open VSX](https://open-vsx.org/) for VSCodium / Cursor / Windsurf.

<details>
<summary>Build from source</summary>

```bash
npm install
npx @vscode/vsce package     # -> reflint-vscode-0.1.0.vsix
code --install-extension reflint-vscode-0.1.0.vsix
```
</details>

## Related

- **reflint** (CLI + GitHub Action): https://github.com/hyuga611/reflint
- **skills-lint** (SKILL.md): https://github.com/hyuga611/skills-lint

MIT
