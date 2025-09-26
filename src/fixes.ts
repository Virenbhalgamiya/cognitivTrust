// Autofix logic for hardcoded secrets

import * as vscode from 'vscode';

export function applyHardcodedSecretFix(document: any, range: any): any {
    const edit = new vscode.WorkspaceEdit();
    edit.replace(document.uri, range, 'process.env.MY_SECRET');
    return edit;
}
