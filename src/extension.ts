import * as vscode from 'vscode';
import { spawn } from 'child_process';
import * as path from 'path';

const DIAGNOSTIC_COLLECTION = 'secureplugin';
const SECURE_PROMPT_SUFFIX = ' Ensure no hardcoded secrets, validate user input, use env vars for credentials.';

let diagnosticCollection: vscode.DiagnosticCollection;

function enrichPrompt(text: string): string {
    return text + SECURE_PROMPT_SUFFIX;
}

function scanWithSemgrep(filePath: string, rulesDir: string): Promise<any[]> {
    return new Promise((resolve) => {
        const semgrep = spawn('semgrep', [
            '--config', rulesDir,
            '--json',
            filePath
        ]);
        let output = '';
        semgrep.stdout.on('data', (data) => {
            output += data.toString();
        });
        semgrep.stderr.on('data', (data) => {
            // Optionally log errors
        });
        semgrep.on('close', () => {
            try {
                const result = JSON.parse(output);
                resolve(result.results || []);
            } catch {
                resolve([]);
            }
        });
    });
}

function showDiagnostics(results: any[], doc: vscode.TextDocument) {
    diagnosticCollection.clear();
    const diagnostics: vscode.Diagnostic[] = [];
    for (const r of results) {
        const startLine = r.start.line - 1;
        const startCol = r.start.col - 1;
        const endLine = r.end.line - 1;
        const endCol = r.end.col - 1;
        const range = new vscode.Range(startLine, startCol, endLine, endCol);
        const diag = new vscode.Diagnostic(
            range,
            r.extra.message || r.check_id,
            vscode.DiagnosticSeverity.Warning
        );
        diag.code = r.check_id;
        diag.source = DIAGNOSTIC_COLLECTION;
        diagnostics.push(diag);
    }
    diagnosticCollection.set(doc.uri, diagnostics);
}

function provideCodeActions(document: vscode.TextDocument, range: vscode.Range, context: vscode.CodeActionContext): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];
    for (const diag of context.diagnostics) {
        if (diag.code === 'hardcoded-secret') {
            const fix = new vscode.CodeAction('Replace with process.env.MY_SECRET', vscode.CodeActionKind.QuickFix);
            fix.edit = new vscode.WorkspaceEdit();
            fix.edit.replace(document.uri, range, 'process.env.MY_SECRET');
            fix.diagnostics = [diag];
            fix.isPreferred = true;
            actions.push(fix);
        }
    }
    return actions;
}

export function activate(context: vscode.ExtensionContext) {
    diagnosticCollection = vscode.languages.createDiagnosticCollection(DIAGNOSTIC_COLLECTION);
    context.subscriptions.push(diagnosticCollection);

    context.subscriptions.push(vscode.commands.registerCommand('secureplugin.scanCurrentFile', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) { return; }
        const doc = editor.document;
        const rulesDir = path.join(context.extensionPath, 'semgrep_rules');
        const results = await scanWithSemgrep(doc.fileName, rulesDir);
        showDiagnostics(results, doc);
    }));

    context.subscriptions.push(vscode.languages.registerCodeActionsProvider(['javascript', 'python'], {
        provideCodeActions
    }, {
        providedCodeActionKinds: [vscode.CodeActionKind.QuickFix]
    }));

    context.subscriptions.push(vscode.workspace.onDidSaveTextDocument(async (doc) => {
        if (['javascript', 'python'].includes(doc.languageId)) {
            const rulesDir = path.join(context.extensionPath, 'semgrep_rules');
            const results = await scanWithSemgrep(doc.fileName, rulesDir);
            showDiagnostics(results, doc);
        }
    }));

    context.subscriptions.push(vscode.languages.registerHoverProvider(['javascript', 'python'], {
        provideHover(document, position) {
            const diagnostics = diagnosticCollection.get(document.uri) || [];
            for (const diag of diagnostics) {
                if (diag.range.contains(position)) {
                    return new vscode.Hover('Remediation: ' + (diag.code === 'hardcoded-secret' ? 'Use environment variables for secrets.' : 'Add authorization checks.'));
                }
            }
            return undefined;
        }
    }));

    context.subscriptions.push(vscode.commands.registerCommand('secureplugin.enrichPrompt', async () => {
        const input = await vscode.window.showInputBox({ prompt: 'Type your prompt:' });
        if (input) {
            vscode.window.showInformationMessage('Enriched Prompt: ' + enrichPrompt(input));
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(async (event) => {
        const doc = event.document;
        for (const change of event.contentChanges) {
            if (change.text.includes('// prompt:')) {
                const enriched = enrichPrompt(change.text);
                vscode.window.showInformationMessage('Enriched Prompt: ' + enriched);
            }
        }
    }));
}

export function deactivate() {
    diagnosticCollection?.dispose();
}
