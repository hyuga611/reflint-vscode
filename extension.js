// reflint-vscode — AGENTS.md / llms.txt / CLAUDE.md の参照整合を、編集中に波線表示する。
// reflint 本体（@hyuga/reflint）の `--format json` 出力を使って Diagnostics に変換するだけの薄い層。
const vscode = require('vscode');
const cp = require('node:child_process');
const path = require('node:path');

const TARGET = /(?:^|[\\/])(AGENTS\.md|llms\.txt|CLAUDE\.md)$/i;
let diagnostics;
let output;

function isTarget(doc) {
  return doc && doc.uri.scheme === 'file' && TARGET.test(doc.fileName);
}

function reflintEntry() {
  // exports "." → src/check.mjs。直接 node で実行すると CLI として動く。
  return require.resolve('@hyuga/reflint');
}

/**
 * この拡張が「何も出さない」とき、それは2つの意味を持ちうる。
 * 「問題が無い」と「一度も検査していない」。編集画面では両方とも同じ見た目 ——
 * 波線が無い —— になるので、区別できないと **無検査を合格として読む** ことになる。
 *
 * 0.1.0 は3か所（entry の解決失敗・JSON パース失敗・そして err の無視）を
 * すべて黙って return していた。ここでは代わりに、ファイル先頭に1件だけ
 * 「検査できなかった」と出す。うるさいが、嘘ではない。
 */
function couldNotRun(doc, reason) {
  const range = new vscode.Range(0, 0, 0, Number.MAX_SAFE_INTEGER);
  const d = new vscode.Diagnostic(
    range,
    `reflint could not run, so this file was not checked: ${reason}`,
    vscode.DiagnosticSeverity.Warning,
  );
  d.source = 'reflint';
  d.code = 'not-run';
  diagnostics.set(doc.uri, [d]);
  if (output) output.appendLine(`${new Date().toISOString()} ${doc.fileName}: ${reason}`);
}

function lint(doc) {
  if (!isTarget(doc)) return;
  let entry;
  try {
    entry = reflintEntry();
  } catch (e) {
    couldNotRun(doc, `@hyuga/reflint could not be resolved (${e && e.message ? e.message : e})`);
    return;
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
    (err, stdout, stderr) => {
      // exit 1 は「指摘があった」なので err が立つのが正常。区別すべきなのは
      // exit 2（実行できなかった）と、そもそも JSON が返っていない場合。
      let data;
      try {
        data = JSON.parse(stdout);
      } catch {
        const why = err && err.killed
          ? 'reflint timed out after 15s'
          : (stderr || '').trim() || (err && err.message) || 'reflint produced no JSON';
        couldNotRun(doc, why.split('\n')[0].slice(0, 200));
        return;
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
  output = vscode.window.createOutputChannel('reflint');
  context.subscriptions.push(diagnostics, output);

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
  if (output) output.dispose();
}

module.exports = { activate, deactivate };
