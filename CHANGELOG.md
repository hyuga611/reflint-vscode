# Changelog

All notable changes to **reflint for VS Code** are documented here.

## [0.2.0] — 2026-08-13

公開版を読み直すのではなく、依存が実際に何に解決されるかを確かめて出てきた2件。

### reflint 0.5.1 に固定されていた（そして永久に上がらなかった）

依存が `"@hyuga/reflint": "^0.5.1"` だった。**0.x では `^` はマイナーをまたがない** ので、
これは `>=0.5.1 <0.6.0` を意味する。reflint は 0.10.0 まで進んでいたのに、新規インストールは
必ず 0.5.1 に解決されていた —— 5マイナー分の検査が入らず、**放っておいても直らない。**

README は「The same reflint checks, inline in the editor」と書いていた。同じではなかった。
0.5.1 は指摘文が日本語のままなので、英語の README を読んで入れた人には日本語の波線が出る、
という食い違いもここから来ていた。

`^0.10.0` に上げた。JSON の形（`ok` / `count` / `findings[].file,line,kind,message`）は
0.5.1 と 0.10.0 で互換なので、変換層の変更は不要だった。

### 「問題なし」と「一度も検査していない」が、画面上で同じだった

エディタ拡張にとって、これはいちばん出してはいけない壊れ方になる。**波線が出ていない**の意味が
2つあり、利用者は必ず「問題なし」のほうに読む。0.1.0 は3か所すべてを黙って握りつぶしていた：

- `@hyuga/reflint` を解決できない → 黙って return
- 出力が JSON として壊れている → 黙って return
- `err`（プロセスの終了コード）→ 一度も見ていない

`err` を無視していたのには理由があって、**指摘があるとき reflint は exit 1 で終わる**ので、
`err` が立つのが正常なケースがある。ただし exit 2（実行できなかった）と、そもそも JSON が
返っていない場合は別で、そこが区別されていなかった。

検査できなかったときは、ファイル先頭に1件だけ
`reflint could not run, so this file was not checked: …` を出すようにした。
理由は `reflint` 出力チャンネルにも書く。波線が1本増えるのはうるさいが、
**無検査を合格として見せるよりはいい。**

## [0.1.0] — 2026-07-21

Initial public release.

- Underlines commands, scripts, and paths in `AGENTS.md` / `llms.txt` / `CLAUDE.md` that no longer exist, shown as **Warning** diagnostics in the editor.
- Runs on file open and save.
- Setting `reflint.codeBlocks` (bool) — also check bare paths inside fenced code blocks (`reflint --code-blocks`).
- Bundles [`@hyuga/reflint`](https://github.com/hyuga611/reflint) — no separate install required.
