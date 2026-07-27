# reflint for VS Code

> Part of a set of zero-dependency CI tools for AI-agent repos — start with **[reflint](https://github.com/hyuga611/reflint)**.

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


## Related tools

Zero-dependency CI linters for repos where AI agents do the work. Each one fails the PR on something that breaks quietly.

| | Catches |
| --- | --- |
| [reflint](https://github.com/hyuga611/reflint) | `AGENTS.md` / `llms.txt` / `CLAUDE.md` pointing at commands, scripts, or paths that no longer exist |
| [skills-lint](https://github.com/hyuga611/skills-lint) | `SKILL.md` broken references + `name`/trigger collisions between skills |
| [carrylint](https://github.com/hyuga611/carrylint) | Skills with the author's machine or model baked in — absolute paths, undeclared CLIs, unresolved placeholders |
| [genchi](https://github.com/hyuga611/genchi) | Agents reporting "done" without re-fetching real-world state |
| [tracklint](https://github.com/hyuga611/tracklint) | Forms and CTAs that quietly stopped being wired for conversion tracking |
| [tokenlint](https://github.com/hyuga611/tokenlint) | Hardcoded colors that bypass your design tokens |
| **reflint for VS Code** ← you are here | The same reflint checks, inline in the editor as you save |
| [orogami](https://github.com/hyuga611/orogami) | Not a linter — natural Japanese/CJK line breaking for OGP images (BudouX + font subsetting) |

MIT
