# TypeScript File Copy Plugin

[![NPM version](https://img.shields.io/npm/v/typescript-file-copy-plugin.svg?style=flat-square)](https://www.npmjs.com/package/typescript-file-copy-plugin)
![NPM Downloads](https://img.shields.io/npm/dm/typescript-file-copy-plugin)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The `typescript-file-copy-plugin` is a TypeScript transformer plugin that copies files or directories as part of the TypeScript build process. This removes the need for additional build tools or scripts to handle file copying operations.

It leverages the [`cpx2`](https://www.npmjs.com/package/cpx2) module to handle file copying, including support for glob patterns, making it flexible for a variety of file copy operations.

*This plugin has been tested against TypeScript version 5.*

## Prerequisites: ts-patch

This plugin requires [`ts-patch`](https://www.npmjs.com/package/ts-patch) to be installed and set up first. `ts-patch` allows for custom TypeScript transformations by patching the TypeScript compiler.

### Installing ts-patch

To install `ts-patch`, run the following command:

```sh
npm install --save-dev ts-patch
```

For more details on setting up `ts-patch`, refer to the [ts-patch documentation](https://github.com/nonara/ts-patch#readme).

There are two ways to patch the TypeScript compiler:

#### 1. Using the CLI

You can change your `tsc` to `tspc` instead.

```json
{
  "scripts": {
    "build": "tspc --project tsconfig.json"
  }
}
```

#### 2. Using the `prepare` Script

You can instead patch the TypeScript compiler by adding this script to your `package.json`, allowing you to continue using `tsc` as normal:

```json
{
  "scripts": {
    "prepare": "ts-patch install -s"
  }
}
```

## Installation

```sh
npm install --save-dev typescript-file-copy-plugin
```

## Usage

### Configuration

To configure the plugin, you need to add it to your `tsconfig.json` file under the `compilerOptions.plugins` section. The `copy` option is an array of objects, where each object specifies a source (`src`) and a destination (`dest`). The `src` and `dest` fields can include glob patterns for flexible file and directory copying.

Here is an example of how to configure the plugin:

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "transform": "typescript-file-copy-plugin",
        "copy": [
          {
            "src": "src/assets/*",
            "dest": "dist/assets"
          },
          {
            "src": "src/config.json",
            "dest": "dist/config.json"
          }
        ]
      }
    ]
  }
}
```

### Example Configurations

1. **Copy a Single File**:
    ```json
    {
      "transform": "typescript-file-copy-plugin",
      "copy": [
        {
          "src": "src/single-file.txt",
          "dest": "dist/single-file.txt"
        }
      ]
    }
    ```

2. **Copy an Entire Directory**:
    ```json
    {
      "transform": "typescript-file-copy-plugin",
      "copy": [
        {
          "src": "src/directory/*",
          "dest": "dist/directory"
        }
      ]
    }
    ```

3. **Copy Files Matching a Wildcard Pattern**:
    ```json
    {
      "transform": "typescript-file-copy-plugin",
      "copy": [
        {
          "src": "src/wildcard/*.txt",
          "dest": "dist/wildcard"
        }
      ]
    }
    ```

4. **Recursive Copy Using Double Wildcard Pattern**:
    ```json
    {
      "transform": "typescript-file-copy-plugin",
      "copy": [
        {
          "src": "src/double-wildcard/**/*",
          "dest": "dist/double-wildcard"
        }
      ]
    }
    ```

5. **Copy Source File to Destination File**:
    ```json
    {
      "transform": "typescript-file-copy-plugin",
      "copy": [
        {
          "src": "src/single-file.txt",
          "dest": "dist/single-file-copy.txt"
        }
      ]
    }
    ```
