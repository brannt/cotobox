cotobox-cli
===========

Conlanger&#39;s ToolBox CLI

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/cotobox-cli.svg)](https://npmjs.org/package/cotobox-cli)
[![Downloads/week](https://img.shields.io/npm/dw/cotobox-cli.svg)](https://npmjs.org/package/cotobox-cli)
[![License](https://img.shields.io/npm/l/cotobox-cli.svg)](https://github.com/brannt/cotobox-cli/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g cotobox-cli
$ ctb COMMAND
running command...
$ ctb (-v|--version|version)
cotobox-cli/0.0.0 darwin-arm64 node-v16.2.0
$ ctb --help [COMMAND]
USAGE
  $ ctb COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`ctb help [COMMAND]`](#ctb-help-command)
* [`ctb sc [LANGFROM] [LANGTO]`](#ctb-sc-langfrom-langto)
* [`ctb sc-tree [FILE]`](#ctb-sc-tree-file)

## `ctb help [COMMAND]`

display help for ctb

```
USAGE
  $ ctb help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.2.2/src/commands/help.ts)_

## `ctb sc [LANGFROM] [LANGTO]`

Apply sound changes to lexicon

```
USAGE
  $ ctb sc [LANGFROM] [LANGTO]

OPTIONS
  -h, --help         show CLI help
  --workdir=workdir  set working dir (current dire)

EXAMPLE
  $ ctb sc protean beyan
```

_See code: [src/commands/sc.ts](https://github.com/brannt/cotobox-cli/blob/v0.0.0/src/commands/sc.ts)_

## `ctb sc-tree [WORD]`

Simulates the changes in the words across the language tree. The workdir should have a `tree.ctb.json` file describing the tree.

```
USAGE
  $ ctb sc-tree word1 word2 word3

OPTIONS
  -h, --help         show CLI help
  --workdir=workdir  directory with the tree soundchange definitions 
```

_See code: [src/commands/sc-tree.ts](https://github.com/brannt/cotobox-cli/blob/v0.0.0/src/commands/sc-tree.ts)_
<!-- commandsstop -->
