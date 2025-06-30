# Run Generate

A VS Code extension for running `//go:generate` commands directly from your Go source files. This extension identifies executable `//go:generate` lines and provides clickable run buttons to execute them in the terminal.

## Features

- **Automatic Detection**: Scans Go files for `//go:generate` comments
- **Inline Run Buttons**: Shows clickable "Run" buttons (CodeLens) next to each `//go:generate` line
- **Terminal Integration**: Executes commands in VS Code's integrated terminal
- **Workspace Context**: Runs commands in the correct workspace directory
- Built with TypeScript for type safety and reliability

## How It Works

When you open a Go file (`.go`), the extension automatically scans for lines that start with `//go:generate`. For each detected line, it displays a clickable "▶ Run" button above the line. 

### Example

```go
//go:generate go install github.com/example/tool@latest
//go:generate protoc --go_out=. example.proto
//go:generate mockgen -source=interface.go -destination=mock.go
```

Each of these lines will show a "▶ Run" button that you can click to execute the command.

## Getting Started

1. Open any `.go` file that contains `//go:generate` comments
2. Look for the "▶ Run" buttons that appear above the generate lines
3. Click any "Run" button to execute that specific command
4. The command will run in VS Code's integrated terminal

## Requirements

- VS Code 1.101.0 or higher
- Go development environment (for the commands to work properly)

## Extension Settings

This extension contributes the following settings:

- `runGenerate.enableCodeLens`: Enable/disable CodeLens buttons for `//go:generate` lines (default: `true`)

To disable the CodeLens feature, add this to your VS Code settings:

```json
{
  "runGenerate.enableCodeLens": false
}
```

## Installation

### From VS Code Marketplace (Recommended)
1. Open VS Code
2. Go to the Extensions view (`Ctrl+Shift+X` on Windows/Linux or `Cmd+Shift+X` on macOS)
3. Search for "Run Generate"
4. Click "Install" on the extension by [Your Publisher Name]

Alternatively, you can install it from the command line:
```bash
code --install-extension [publisher].[extension-name]
```

### From VSIX Package
If you have a `.vsix` file:
1. Download the `.vsix` file from the [Releases page](https://github.com/your-username/run-generate/releases)
2. In VS Code, go to Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X`)
3. Click the "..." menu (Views and More Actions) and select "Install from VSIX..."
4. Select the downloaded `.vsix` file
5. Restart VS Code if prompted

### From Source (Development)
For developers who want to build from source:
1. Clone this repository:
   ```bash
   git clone https://github.com/your-username/run-generate.git
   cd run-generate
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Compile the extension:
   ```bash
   npm run compile
   ```
4. Press `F5` in VS Code to open a new Extension Development Host window with the extension loaded

## Development

To work on this extension:

1. Open the project in VS Code
2. Run `npm install` to install dependencies
3. Press `F5` to start debugging - this opens a new Extension Development Host window
4. Open a Go file with `//go:generate` comments to test the functionality

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `myExtension.enable`: Enable/disable this extension.
* `myExtension.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
