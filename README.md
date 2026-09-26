# Adobe InDesign ExtendScript Boilerplate for TypeScript

This project provides a boilerplate and development setup for creating Adobe InDesign ExtendScripts using TypeScript.

## Project Structure

- `source/`: Contains the TypeScript source code.
  - `main.ts`: The entry point for the script.
  - `runner.ts` / `runnerclass.ts`: Core logic defined in the `Runner` class.
- `build/`: The output directory for the transpiled JavaScript files.
- `docs/`: Reference documentation and sample IDML files for testing.

## Prerequisites

- Node.js installed.
- Adobe InDesign (to run the generated scripts).

## Developing

This project uses `esbuild` for bundling and `tsc` for type checking.

### Available Scripts

Run these commands in your terminal:

- `npm run dev`: Starts a development environment, watching for changes in both TypeScript files (for errors) and triggering a bundle build.
- `npm run watch:build`: Manually triggers a continuous build using `esbuild` to generate the output file `build/dnt.js`.
- `npm run watch:tsc`: Continuously checks types using the TypeScript compiler.

## Usage

1. Modify the code in `source/`.
2. The development script will automatically bundle your code into `build/dnt.js`.
3. Load `build/dnt.js` in Adobe InDesign to execute the script.
