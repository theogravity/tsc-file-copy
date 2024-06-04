import { copyFileSync, existsSync, statSync } from "node:fs";
import { dirname, extname, resolve } from "node:path";
import { copySync } from "cpx2";
import { mkdirpSync } from "mkdirp";
import type * as ts from "typescript";

interface FileCopyConfig {
  /**
   * The source file or directory to copy.
   */
  src: string;
  /**
   * The destination file or directory to copy to.
   */
  dest: string;
}

interface CopyFilesPluginOptions {
  copy: FileCopyConfig[];
}

/**
 * Validates the options passed to the plugin.
 * Ensures that the 'copy' property is defined, is an array,
 * and each item in the array has both 'src' and 'dest' properties.
 *
 * @param options - The options to validate
 * @throws Will throw an error if validation fails
 */
function validateOptions(options: CopyFilesPluginOptions): void {
  if (!options.copy || !Array.isArray(options.copy)) {
    throw new Error("The 'copy' parameter must be defined and be an array.");
  }

  options.copy.forEach((config, index) => {
    if (!config.src) {
      throw new Error(`The 'src' property is missing in the copy config at index ${index}.`);
    }
    if (!config.dest) {
      throw new Error(`The 'dest' property is missing in the copy config at index ${index}.`);
    }
  });
}

/**
 * Creates a transformer factory for the TypeScript program.
 * In this case, it simply returns the source file without any transformations.
 *
 * @param program - The TypeScript program
 * @param options - The plugin options
 * @returns A factory function for creating transformers
 */
function createCopyFilesTransformer(
  program: ts.Program,
  options: CopyFilesPluginOptions,
): ts.TransformerFactory<ts.SourceFile> {
  return (context) => (sourceFile) => {
    return sourceFile; // No transformation, just copying files post compilation
  };
}

/**
 * Handles the copying of files post compilation.
 * Overrides the emit method of the TypeScript program to perform file copying.
 *
 * @param program - The TypeScript program
 * @param options - The plugin options
 */
function copyFilesPostCompilation(program: ts.Program, options: CopyFilesPluginOptions) {
  const copiedPaths = new Set<string>();
  const origEmit = program.emit;

  // Override the emit method
  program.emit = (...args) => {
    const result = origEmit(...args);

    for (const config of options.copy) {
      const resolvedDest = resolve(config.dest);
      // Check if the destination has already been copied
      if (!copiedPaths.has(resolvedDest)) {
        // Check if the source is a file and the destination string contains a file extension
        if (existsSync(config.src) && statSync(config.src).isFile() && extname(config.dest)) {
          // Create the destination directory if it doesn't exist
          mkdirpSync(dirname(resolvedDest));
          // Use the native fs.copyFileSync for file-to-file copying
          copyFileSync(config.src, resolvedDest);
        } else {
          // Use cpx2 for directory or wildcard pattern copying
          copySync(config.src, config.dest);
        }
        copiedPaths.add(resolvedDest);
      }
    }

    return result;
  };
}

/**
 * The main plugin function.
 * Validates the options, sets up post compilation file copying,
 * and creates the necessary transformer.
 *
 * @param program - The TypeScript program
 * @param pluginOptions - The options for the plugin
 * @returns A factory function for creating transformers
 */
export default function (program: ts.Program, pluginOptions: CopyFilesPluginOptions) {
  validateOptions(pluginOptions);
  copyFilesPostCompilation(program, pluginOptions);
  return createCopyFilesTransformer(program, pluginOptions);
}
