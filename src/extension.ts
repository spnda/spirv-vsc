import * as vscode from 'vscode';
import * as which from 'which';

import {EditorProvider} from './editor_provider';

export var fallbackDisassemblerPath: string | null = null; 

export function activate(context: vscode.ExtensionContext) {
	const configuredView = vscode.workspace.getConfiguration().get('spirvtools.disassemblerLocation');
    if (configuredView === undefined || !(typeof configuredView === 'string') || configuredView.length == 0) {
        let spirvDis = which.sync('spirv-dis', { nothrow: true });
        if (spirvDis == null) {
            console.log("Could not find spirv-dis in PATH");
        } else {
            console.log("Found fallback spirv-dis: " + spirvDis);
            fallbackDisassemblerPath = spirvDis;
            vscode.workspace.getConfiguration().update('spirvtools.disassemblerLocation', spirvDis); 
        }
    }

    const viewProvider = new EditorProvider();
    context.subscriptions.push(vscode.window.registerCustomEditorProvider('spirv-binary', viewProvider, {
        webviewOptions: {
            enableFindWidget: true, retainContextWhenHidden: true
        }
    }));
}
