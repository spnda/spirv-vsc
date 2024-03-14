import * as vscode from 'vscode';
import * as cp from 'child_process';
import { fallbackDisassemblerPath } from './extension';

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
        doc.uri = uri;

        let disPath = vscode.workspace.getConfiguration().get('spirvtools.disassemblerLocation');
        if (disPath === undefined || disPath === null || !(typeof disPath === 'string') || disPath.length == 0) {
            if (fallbackDisassemblerPath != null) {
                console.log("Using fallback disassembler path");
                disPath = fallbackDisassemblerPath;
            } else {
                doc.error = "Invalid path set for spirv-dis executable.";
                return doc;
            }
        }

        let dis = cp.spawnSync(
            disPath as string,
            [uri.path],
            {
                encoding: 'utf-8'
            }
        );

        doc.error = dis.stderr;
        doc.contents = dis.stdout;
        return doc;
	}

	public resolveCustomEditor(document: vscode.CustomDocument, webviewPanel: vscode.WebviewPanel, token: vscode.CancellationToken): void | Thenable<void> {
        const doc = document as BinarySpirvDocument;
		// doc.init(webviewPanel);
        if (doc.contents !== undefined && doc.error.length == 0) {
            webviewPanel.webview.html = "<html><body><pre>" + doc.contents + "</pre></body></html>";
        } else {
            webviewPanel.webview.html = "<html><body>Failed to disassemble SPIR-V: " + doc.error + "</body></html>";
        }
    }
}
