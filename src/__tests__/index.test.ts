import * as fs from "node:fs";
import * as path from "node:path";
import type { Program } from "typescript";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import copyFilesPlugin from "../index";

// Mock the TypeScript Program interface
const mockProgram: Partial<Program> = {
  emit: vi.fn((...args) => ({ emitSkipped: false, diagnostics: [] })),
};

const fileStructure = {
  "tmp/single-file.txt": "Single File Content",
  "tmp/directory/file1.txt": "File 1 Content",
  "tmp/directory/file2.txt": "File 2 Content",
  "tmp/wildcard/file1.txt": "Wildcard File 1 Content",
  "tmp/wildcard/file2.txt": "Wildcard File 2 Content",
  "tmp/double-wildcard/dir1/file1.txt": "Double Wildcard File 1 Content",
  "tmp/double-wildcard/dir2/file2.txt": "Double Wildcard File 2 Content",
};

beforeEach(() => {
  const directories = new Set<string>();

  for (const filePath of Object.keys(fileStructure)) {
    const fullPath = path.resolve(filePath);
    const dir = path.dirname(fullPath);
    directories.add(dir);
  }

  for (const dir of directories) {
    fs.mkdirSync(dir, { recursive: true });
  }

  for (const filePath of Object.keys(fileStructure)) {
    const fullPath = path.resolve(filePath);
    fs.writeFileSync(fullPath, fileStructure[filePath]);
  }
});

afterEach(() => {
  const dirsToRemove = ["tmp", "dest"];

  for (const dir of dirsToRemove) {
    const fullPath = path.resolve(dir);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }
});

describe("CopyFilesPlugin", () => {
  it("should throw if the copy parameter is not defined", () => {
    const options = { copy: undefined }; // This should cause an error

    expect(() => copyFilesPlugin(mockProgram as Program, options as any)).toThrow(
      "The 'copy' parameter must be defined and be an array.",
    );
  });

  it("should throw if the src property is missing", () => {
    const options = { copy: [{ dest: "dest" }] }; // Missing src

    expect(() => copyFilesPlugin(mockProgram as Program, options as any)).toThrow(
      "The 'src' property is missing in the copy config at index 0.",
    );
  });

  it("should throw if the dest property is missing", () => {
    const options = { copy: [{ src: "tmp/single-file.txt" }] }; // Missing dest

    expect(() => copyFilesPlugin(mockProgram as Program, options as any)).toThrow(
      "The 'dest' property is missing in the copy config at index 0.",
    );
  });

  it("should copy a single file", () => {
    const options = { copy: [{ src: "tmp/single-file.txt", dest: "dest" }] };

    copyFilesPlugin(mockProgram as Program, options);

    mockProgram.emit!();

    const copiedFilePath = path.resolve("dest/single-file.txt");
    expect(fs.existsSync(copiedFilePath)).toBe(true);
    expect(fs.readFileSync(copiedFilePath, "utf-8")).toBe("Single File Content");
  });

  it("should copy a directory", () => {
    const options = { copy: [{ src: "tmp/directory/*", dest: "dest/directory" }] };

    copyFilesPlugin(mockProgram as Program, options);

    mockProgram.emit!();

    for (const fileName of ["file1.txt", "file2.txt"]) {
      const copiedFilePath = path.resolve(`dest/directory/${fileName}`);
      expect(fs.existsSync(copiedFilePath)).toBe(true);
      expect(fs.readFileSync(copiedFilePath, "utf-8")).toBe(fileStructure[`tmp/directory/${fileName}`]);
    }
  });

  it("should copy files matching a wildcard pattern", () => {
    const options = { copy: [{ src: "tmp/wildcard/*.txt", dest: "dest/wildcard" }] };

    copyFilesPlugin(mockProgram as Program, options);

    mockProgram.emit!();

    for (const fileName of ["file1.txt", "file2.txt"]) {
      const copiedFilePath = path.resolve(`dest/wildcard/${fileName}`);
      expect(fs.existsSync(copiedFilePath)).toBe(true);
      expect(fs.readFileSync(copiedFilePath, "utf-8")).toBe(fileStructure[`tmp/wildcard/${fileName}`]);
    }
  });

  it("should copy files matching a double wildcard pattern (recursive copy)", () => {
    const options = { copy: [{ src: "tmp/double-wildcard/**/*", dest: "dest/double-wildcard" }] };

    copyFilesPlugin(mockProgram as Program, options);

    mockProgram.emit!();

    for (const filePath of ["dir1/file1.txt", "dir2/file2.txt"]) {
      const copiedFilePath = path.resolve(`dest/double-wildcard/${filePath}`);
      expect(fs.existsSync(copiedFilePath)).toBe(true);
      expect(fs.readFileSync(copiedFilePath, "utf-8")).toBe(fileStructure[`tmp/double-wildcard/${filePath}`]);
    }
  });

  it("should copy src file to dest file", () => {
    const options = { copy: [{ src: "tmp/single-file.txt", dest: "dest/single-file-copy.txt" }] };

    copyFilesPlugin(mockProgram as Program, options);

    mockProgram.emit!();

    const copiedFilePath = path.resolve("dest/single-file-copy.txt");
    expect(fs.existsSync(copiedFilePath)).toBe(true);
    expect(fs.readFileSync(copiedFilePath, "utf-8")).toBe("Single File Content");
  });
});
