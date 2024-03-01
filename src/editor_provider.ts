import * as vscode from 'vscode';
import * as cp from 'child_process';

class BinarySpirvDocument implements vscode.CustomDocument {
    uri: vscode.Uri;
    error: string;
    contents: string;

    public dispose(): void {
    }
}

export class EditorProvider implements vscode.CustomReadonlyEditorProvider {
	public openCustomDocument(uri: vscode.Uri, openContext: vscode.CustomDocumentOpenContext, token: vscode.CancellationToken): vscode.CustomDocument | Thenable<vscode.CustomDocument> {
        let doc = new BinarySpirvDocument();

        let dis = cp.spawnSync(
            '/usr/local/bin/spirv-dis',
            [uri.path],
            {
                encoding: 'utf-8'
            }
        );

        doc.error = dis.stderr;
        doc.contents = dis.stdout;
        doc.uri = uri;
        return doc;
	}

	public resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
        const doc = document as BinarySpirvDocument;
		// doc.init(webviewPanel);
        if (doc.error.length == 0) {
            webviewPanel.webview.html = "<html><body><pre>" + doc.contents + "</pre></body></html>";
        } else {
            webviewPanel.webview.html = "<html><body>Failed to disassemble SPIR-V: " + doc.error + "</body></html>";
        }
    }
}
