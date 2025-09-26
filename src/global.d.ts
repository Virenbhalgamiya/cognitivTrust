// Fix implicit any errors for parameters

// child_process spawn event types
interface DataEvent {
  (data: Buffer): void;
}

declare namespace NodeJS {
  interface Process {
    stdout: {
      on(event: 'data', listener: DataEvent): void;
    };
    stderr: {
      on(event: 'data', listener: DataEvent): void;
    };
  }
}

// VSCode event parameter types
import * as vscode from 'vscode';

declare global {
  type TextDocument = vscode.TextDocument;
  type TextDocumentChangeEvent = vscode.TextDocumentChangeEvent;
  type Position = vscode.Position;
}
