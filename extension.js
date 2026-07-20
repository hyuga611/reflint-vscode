// reflint-vscode — AGENTS.md / llms.txt / CLAUDE.md の参照整合を、編集中に波線表示する。
// reflint 本体（@hyuga/reflint）の `--format json` 出力を使って Diagnostics に変換するだけの薄い層。
const vscode = require('vscode');
const cp = require('node:child_process');
const path = require('node:path');

const TARGET = /(?:^|[\\/])(AGENTS\.md|llms\.txt|CLAUDE\.md)$/i;
let diagnostics;

function isTarget(doc) {
  return doc && doc.uri.scheme === 'file' && TARGET.test(doc.fileName);
}

function reflintEntry() {
  // exports "." → src/check.mjs。直接 node で実行すると CLI として動く。
  return require.resolve('@hyuga/reflint');
}

function lint(doc) {
  if (!isTarget(doc)) return;
  let entry;
  try {
    entry = reflintEntry();
  } catch {
    return; // 依存が解決できない環境では黙ってスキップ
  }
  const folder = vscode.workspace.getWorkspaceFolder(doc.uri);
  const cwd = folder ? folder.uri.fsPath : path.dirname(doc.fileName);
  const codeBlocks = vscode.workspace.getConfiguration('reflint').get('codeBlocks', false);
  const args = [entry, '--format', 'json'];
  if (codeBlocks) args.push('--code-blocks');
  args.push(doc.fileName);

  cp.execFile(
    process.execPath,
    args,
    { cwd, env: { ...process.env, ELECTRON_RUN_AS_NODE: '1' }, timeout: 15000 },
    (err, stdout) => {
      let data;
      try {
        data = JSON.parse(stdout);
      } catch {
        return; // 出力が壊れていたら何もしない（誤報を出さない）
      }
      const items = (data.findings || []).map((f) => {
        const line = Math.max(0, (f.line || 1) - 1);
        const range = new vscode.Range(line, 0, line, Number.MAX_SAFE_INTEGER);
        const d = new vscode.Diagnostic(range, f.message || 'reflint', vscode.DiagnosticSeverity.Warning);
        d.source = 'reflint';
        if (f.kind) d.code = f.kind;
        return d;
      });
      diagnostics.set(doc.uri, items);
    },
  );
}

function activate(context) {
  diagnostics = vscode.languages.createDiagnosticCollection('reflint');
  context.subscriptions.push(diagnostics);

  const relint = (doc) => lint(doc);
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(relint),
    vscode.workspace.onDidSaveTextDocument(relint),
    vscode.workspace.onDidCloseTextDocument((doc) => diagnostics.delete(doc.uri)),
  );
  // 既に開いているエディタも一度検査
  for (const ed of vscode.window.visibleTextEditors) lint(ed.document);
}

function deactivate() {
  if (diagnostics) diagnostics.dispose();
}

module.exports = { activate, deactivate };
