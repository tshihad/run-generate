// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Global terminal reference for reuse
let runGenerateTerminal: vscode.Terminal | undefined;
// Global output channel for showing command results
let outputChannel: vscode.OutputChannel | undefined;

/**
 * CodeLens provider for Go files that shows run buttons for //go:generate lines
 */
class GoGenerateCodeLensProvider implements vscode.CodeLensProvider {

	onDidChangeCodeLenses: vscode.Event<void>;
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();

	constructor() {
		this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
	}

	provideCodeLenses(document: vscode.TextDocument): vscode.CodeLens[] {
		const codeLenses: vscode.CodeLens[] = [];

		try {
			// Check if CodeLens is enabled
			const config = vscode.workspace.getConfiguration('runGenerate');
			const enableCodeLens = config.get<boolean>('enableCodeLens', true);

			if (!enableCodeLens) {
				return codeLenses;
			}

			// Only process Go files
			if (document.languageId !== 'go') {
				return codeLenses;
			}

			// Scan through all lines in the document
			for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
				const line = document.lineAt(lineIndex);
				const text = line.text.trim();

				// Check if line starts with //go:generate
				if (text.startsWith('//go:generate')) {
					// Extract the command (everything after //go:generate)
					let command = text.substring('//go:generate'.length).trim();

					// Apply regex replacement to wrap flag values in quotes
					command = command.replace(/(--[a-zA-Z_]+=)([^ ]+)/g, '$1"$2"');

					if (command) {
						// Create a code lens at the beginning of this line
						const range = new vscode.Range(lineIndex, 0, lineIndex, line.text.length);
						const codeLens = new vscode.CodeLens(range, {
							title: '$(play) Run',
							command: 'run-generate.runGoGenerate',
							arguments: [command, document.uri, lineIndex + 1]
						});

						codeLenses.push(codeLens);
					}
				}
			}
		} catch (error) {
			console.error('Error in GoGenerateCodeLensProvider:', error);
		}

		return codeLenses;
	}

	refresh(): void {
		this._onDidChangeCodeLenses.fire();
	}
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// Register the CodeLens provider for Go files
	const codeLensProvider = new GoGenerateCodeLensProvider();
	const codeLensDisposable = vscode.languages.registerCodeLensProvider(
		{ language: 'go', scheme: 'file' },
		codeLensProvider
	);

	// Listen for configuration changes to refresh CodeLens
	const configChangeDisposable = vscode.workspace.onDidChangeConfiguration(e => {
		if (e.affectsConfiguration('runGenerate.enableCodeLens')) {
			codeLensProvider.refresh();
		}
	});

	// Register the command to run go:generate commands
	const runCommandDisposable = vscode.commands.registerCommand('run-generate.runGoGenerate',
		async (command: string, documentUri: vscode.Uri, lineNumber?: number) => {
			try {
				// Get the workspace folder for the document
				const workspaceFolder = vscode.workspace.getWorkspaceFolder(documentUri);

				if (!workspaceFolder) {
					vscode.window.showErrorMessage('No workspace folder found for the file');
					return;
				}

				// Create output channel if it doesn't exist
				if (!outputChannel) {
					outputChannel = vscode.window.createOutputChannel('Run Generate');
				}

				// Show progress indicator
				await vscode.window.withProgress({
					location: vscode.ProgressLocation.Notification,
					title: "Running go:generate command",
					cancellable: false
				}, async (progress) => {
					progress.report({ message: `Executing: ${command}` });

					// Get the directory of the current file
					const fileDirectory = documentUri.fsPath;
					const directoryPath = path.dirname(fileDirectory);

					// Show the output channel
					outputChannel!.show(true);
					outputChannel!.appendLine(`\n=== Running go:generate command ===`);
					outputChannel!.appendLine(`Directory: ${directoryPath}`);
					outputChannel!.appendLine(`Command: ${command}`);
					outputChannel!.appendLine(`Time: ${new Date().toLocaleTimeString()}`);
					outputChannel!.appendLine('');

					try {
						// Execute the command in the file's directory
						const { stdout, stderr } = await execAsync(command, {
							cwd: directoryPath,
							timeout: 30000 // 30 second timeout
						});

						// Show stdout if there's any
						if (stdout) {
							outputChannel!.appendLine('Output:');
							outputChannel!.appendLine(stdout);
						}

						// Show stderr if there's any (but not as an error since some tools use stderr for info)
						if (stderr) {
							outputChannel!.appendLine('Messages:');
							outputChannel!.appendLine(stderr);
						}

						outputChannel!.appendLine('=== Command completed successfully ===\n');
					} catch (error: any) {
						// Handle execution errors
						outputChannel!.appendLine('Error:');
						if (error.stdout) {
							outputChannel!.appendLine('stdout:');
							outputChannel!.appendLine(error.stdout);
						}
						if (error.stderr) {
							outputChannel!.appendLine('stderr:');
							outputChannel!.appendLine(error.stderr);
						}
						outputChannel!.appendLine(`Error message: ${error.message}`);
						outputChannel!.appendLine('=== Command failed ===\n');

						// Show error message
						vscode.window.showErrorMessage(`Command failed: ${error.message}`);
					}
				});

			} catch (error) {
				console.error('Error running go:generate command:', error);
				vscode.window.showErrorMessage(`Failed to run command: ${error}`);
			}
		}
	);

	// Listen for terminal close events to clean up our reference
	const terminalCloseDisposable = vscode.window.onDidCloseTerminal(closedTerminal => {
		if (runGenerateTerminal === closedTerminal) {
			runGenerateTerminal = undefined;
		}
	});

	// Add subscriptions to context so they are disposed when extension is deactivated
	context.subscriptions.push(codeLensDisposable, configChangeDisposable, runCommandDisposable, terminalCloseDisposable);
}

// This method is called when your extension is deactivated
export function deactivate() {
	// Clean up the terminal if it exists
	if (runGenerateTerminal && runGenerateTerminal.exitStatus === undefined) {
		runGenerateTerminal.dispose();
	}
	runGenerateTerminal = undefined;

	// Clean up the output channel if it exists
	if (outputChannel) {
		outputChannel.dispose();
	}
	outputChannel = undefined;
}
