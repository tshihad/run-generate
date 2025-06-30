import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Run Generate Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Extension should be present', () => {
		assert.ok(vscode.extensions.getExtension('undefined_publisher.run-generate'));
	});

	test('Should activate extension', async () => {
		const extension = vscode.extensions.getExtension('undefined_publisher.run-generate');
		if (extension) {
			await extension.activate();
			assert.strictEqual(extension.isActive, true);
		}
	});

	test('Commands should be registered', async () => {
		const commands = await vscode.commands.getCommands(true);
		const hasRunCommand = commands.includes('run-generate.runGoGenerate');
		assert.strictEqual(hasRunCommand, true, 'run-generate.runGoGenerate command should be registered');
	});
});
