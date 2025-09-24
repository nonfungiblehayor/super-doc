import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

class CommandsTreeProvider implements vscode.TreeDataProvider<vscode.TreeItem> {
  getTreeItem(element: vscode.TreeItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: vscode.TreeItem): Thenable<vscode.TreeItem[]> {
    const openPanelItem = new vscode.TreeItem("Open Superdoc Panel");
    openPanelItem.command = {
      command: 'superdoc.showPanel',
      title: 'Show Superdoc Panel',
    };
    openPanelItem.iconPath = new vscode.ThemeIcon('rocket');

    return Promise.resolve([
      openPanelItem
    ]);
  }
}

export function activate(context: vscode.ExtensionContext) {
  console.log('[SUCCESS] Your extension "test-vscode" is now active!');

  const commandsTreeProvider = new CommandsTreeProvider();
  vscode.window.registerTreeDataProvider(
    'superdoc.commandsView',
    commandsTreeProvider
  );
  let showPanelCommand = vscode.commands.registerCommand('superdoc.showPanel', () => {
    const panel = vscode.window.createWebviewPanel(
      'reactPanel',
      'Superdoc',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        localResourceRoots: [context.extensionUri]
      }
    );

    const buildUri = vscode.Uri.joinPath(context.extensionUri, 'webview-ui', 'dist');
    const indexPath = vscode.Uri.joinPath(buildUri, 'index.html');
    let html = fs.readFileSync(indexPath.fsPath, 'utf8');

    html = html.replace(/(href|src)="(\.?\/[^"]*)"/g, (match, attr, p) => {
        const assetUri = vscode.Uri.joinPath(buildUri, p.replace(/^\./, ''));
        const webviewUri = panel.webview.asWebviewUri(assetUri);
        return `${attr}="${webviewUri}"`;
    });
    
    panel.webview.html = html;
  });

  context.subscriptions.push(showPanelCommand);
}

export function deactivate() {}
