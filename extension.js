const vscode = require('vscode');

const CORES = ['azul', 'verde', 'rosa', 'amarela', 'roxa'];

class FadaProvider {
  constructor(context) {
    this.context = context;
    this.view = undefined;
    this.lastErrors = 0;
  }

  resolveWebviewView(view) {
    this.view = view;
    const mediaUri = vscode.Uri.joinPath(this.context.extensionUri, 'media');
    view.webview.options = { enableScripts: true, localResourceRoots: [mediaUri] };
    view.webview.html = this.html(view.webview, mediaUri);

    view.webview.onDidReceiveMessage((msg) => {
      if (msg.type === 'ready') {
        this.sendConfig();
        this.checkDiagnostics(true);
      }
    });
    view.onDidChangeVisibility(() => view.visible && this.sendConfig());
  }

  post(msg) {
    if (this.view) this.view.webview.postMessage(msg);
  }

  sendConfig() {
    const cfg = vscode.workspace.getConfiguration('fadaPet');
    this.post({
      type: 'config',
      cor: cfg.get('cor', 'azul'),
      tamanho: cfg.get('tamanho', 3),
      dicas: cfg.get('dicas', true),
      frase: cfg.get('frase', 'Ei! Escuta aqui!'),
    });
  }

  checkDiagnostics(silent = false) {
    const cfg = vscode.workspace.getConfiguration('fadaPet');
    const editor = vscode.window.activeTextEditor;
    if (!cfg.get('reagirErros', true) || !editor) {
      this.lastErrors = 0;
      this.post({ type: 'diagnostics', errors: 0, warnings: 0, silent: true });
      return;
    }
    const diags = vscode.languages.getDiagnostics(editor.document.uri);
    const errors = diags.filter((d) => d.severity === vscode.DiagnosticSeverity.Error).length;
    const warnings = diags.filter((d) => d.severity === vscode.DiagnosticSeverity.Warning).length;
    const file = editor.document.fileName.split(/[\\/]/).pop();
    const changed = errors !== this.lastErrors;
    this.post({
      type: 'diagnostics',
      errors,
      warnings,
      file,
      fixed: changed && errors === 0 && this.lastErrors > 0,
      silent: silent || !changed,
    });
    this.lastErrors = errors;
  }

  html(webview, mediaUri) {
    const nonce = Math.random().toString(36).slice(2) + Date.now().toString(36);
    const uri = (f) => webview.asWebviewUri(vscode.Uri.joinPath(mediaUri, f));
    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<link rel="stylesheet" href="${uri('style.css')}">
</head>
<body>
<canvas id="c"></canvas>
<div id="bubble"></div>
<script nonce="${nonce}" src="${uri('sprites.js')}"></script>
<script nonce="${nonce}" src="${uri('fairy.js')}"></script>
</body>
</html>`;
  }
}

function activate(context) {
  const provider = new FadaProvider(context);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider('fadaPet.view', provider, {
      webviewOptions: { retainContextWhenHidden: true },
    }),

    vscode.commands.registerCommand('fadaPet.chamar', async () => {
      await vscode.commands.executeCommand('fadaPet.view.focus');
      setTimeout(() => provider.post({ type: 'hello' }), 300);
    }),

    vscode.commands.registerCommand('fadaPet.trocarCor', async () => {
      const cor = await vscode.window.showQuickPick(CORES, { placeHolder: 'Escolha a cor da fada' });
      if (cor) {
        await vscode.workspace.getConfiguration('fadaPet').update('cor', cor, vscode.ConfigurationTarget.Global);
      }
    }),

    vscode.workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration('fadaPet')) {
        provider.sendConfig();
        provider.checkDiagnostics(true);
      }
    }),

    vscode.workspace.onDidSaveTextDocument(() => provider.post({ type: 'save' })),

    vscode.workspace.onDidChangeTextDocument((e) => {
      if (e.document.uri.scheme === 'file' || e.document.uri.scheme === 'untitled') {
        provider.post({ type: 'activity' });
      }
    }),

    // Erros de execução: terminal integrado (código de saída do comando)
    ...(vscode.window.onDidEndTerminalShellExecution
      ? [vscode.window.onDidEndTerminalShellExecution((e) => {
          const code = e.exitCode;
          // ignora sucesso, desconhecido e Ctrl+C (130)
          if (code === undefined || code === 0 || code === 130) return;
          const cmd = (e.execution.commandLine && e.execution.commandLine.value) || 'comando';
          const curto = cmd.length > 30 ? cmd.slice(0, 29) + '…' : cmd;
          provider.post({ type: 'runError', text: `Deu erro! 😱\n${curto} (código ${code})` });
        })]
      : []),

    // Erros de execução: tasks
    vscode.tasks.onDidEndTaskProcess((e) => {
      if (e.exitCode !== undefined && e.exitCode !== 0) {
        provider.post({ type: 'runError', text: `A task "${e.execution.task.name}" falhou! 😱 (código ${e.exitCode})` });
      }
    }),

    // Erros de execução: depuração (exceção ou saída com código != 0)
    vscode.debug.registerDebugAdapterTrackerFactory('*', {
      createDebugAdapterTracker() {
        return {
          onDidSendMessage(m) {
            if (m.type !== 'event') return;
            if (m.event === 'stopped' && m.body && m.body.reason === 'exception') {
              provider.post({ type: 'runError', text: 'Exceção! O programa parou com erro 😱' });
            } else if (m.event === 'exited' && m.body && m.body.exitCode) {
              provider.post({ type: 'runError', text: `O programa terminou com erro! 😱 (código ${m.body.exitCode})` });
            }
          },
        };
      },
    }),

    vscode.languages.onDidChangeDiagnostics(() => provider.checkDiagnostics()),
    vscode.window.onDidChangeActiveTextEditor(() => provider.checkDiagnostics(true))
  );
}

function deactivate() {}

module.exports = { activate, deactivate };
