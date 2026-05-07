# Devflow

Devflow is a Node.js CLI that automates parts of a developer workflow. Today it focuses on project initialization and AI-assisted documentation generation for a local codebase.

## Features

- Interactive project init that stores global repo settings
- Documentation generation from your local files using Gemini
- File traversal with include/exclude controls and hidden-file toggles
- Embeddings cache persisted per project for reuse

## Requirements

- Node.js with ESM support
- A Gemini API key in `GEMINI_API_KEY`

## Install

For local development:

```bash
npm install
node bin/devflow.js --help
```

To use the `devflow` command globally from this repo:

```bash
npm install
npm link
devflow --help
```

## Setup

Create a `.env` file in the project root:

```bash
GEMINI_API_KEY=your_api_key_here
```

The CLI loads this file automatically on startup.

## Usage

Initialize global config:

```bash
devflow init
```

Generate documentation:

```bash
devflow docs
```

Include hidden files and exclude specific folders:

```bash
devflow docs --includeHidden --excludeList node_modules,dist,coverage
```

## Commands

### `devflow init`

Prompts for:

- `repo_name`
- `main_branch`
- `base_branch`

These values are stored in a global config file at `~/devflow/config.json`.

### `devflow docs`

Generates a high-level project overview using Gemini. Options:

- `--includeHidden` include dotfiles and hidden folders
- `--excludeList <items>` comma-separated names to skip

## How documentation generation works

1. The file system is traversed and a folder tree is built.
2. Each non-empty file is split into semantic chunks.
3. Embeddings are generated and stored in `embedding.json` in the current working directory.
4. The content is grouped by file and batched to fit context limits.
5. Gemini generates partial docs per batch, then refines them into a single overview using the folder tree.

Models used (as configured in code):

- `gemini-2.5-flash` for text generation
- `gemini-embedding-001` for embeddings

## Project structure (high level)

- `bin/` CLI entrypoint
- `src/commands/` CLI commands (currently `init` and `docs` are wired)
- `src/modules/` core services and utilities
- `src/dependency/` service wiring and factories

## Status

Several command and module files exist as placeholders (for example commit/PR, repo analysis, and VCS helpers) but are not implemented yet. Only `init` and `docs` are currently exposed by the CLI.
