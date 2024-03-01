import * as vscode from 'vscode';
import * as cp from 'child_process';

import {EditorProvider} from './editor_provider';

export function activate(context: vscode.ExtensionContext) {
    const viewProvider = new EditorProvider();
    vscode.window.registerCustomEditorProvider('spirv-binary', viewProvider, {
        webviewOptions: {
            enableFindWidget: true, retainContextWhenHidden: true
        }
    });
}
