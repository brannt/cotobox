import * as fs from 'fs'
import cli from 'cli-ux'

import { Command, flags } from '@oclif/command'

import type { ISystemEnvironment } from 'cotobox-core'
import { usecases, Registry, ExecutableSoundChangeSet, ZompistSCADialect } from 'cotobox-core'
import { CliEnvironment } from '../systemenv'

interface Deps { env: ISystemEnvironment, registry: Registry }

export default class ScTree extends Command {
  static description = 'describe the command here';
  static strict = false;

  static flags = {
    help: flags.help({ char: 'h' }),
    workdir: flags.string(),
  }

  static args = [{ name: 'word' }];

  private deps: Deps = buildDeps();

  async run() {
    let { words } = this.handleArgs()
    if (!words.length) {
      words = await this.inputWords();
    }

    const results = await this.scTree(words);

    const { table, headers } = prepTableFromResults(results)
    printTable(table, headers)
  }

  handleArgs(): { words: string[] } {
    const { argv, flags } = this.parse(ScTree);


    if (flags.workdir) {
      this.deps.env.setWorkDir(flags.workdir);
    }

    return { words: argv.slice() }
  }

  async inputWords(): Promise<string[]> {
    let words = [];
    while (true) {
      const word = await cli.prompt("Add word", { required: false });
      if (word === '') {
        break;
      }
      words.push(word);
    }
    return words
  }

  async scTree(words: string[]) {
    const builder = new usecases.TreeBuilder(this.deps.registry);

    const treedef = JSON.parse(await this.deps.env.loadFile('tree.ctb.json', 'utf-8'));
    const res = builder.build(treedef);
    if (!res.ok) {
      throw new Error(res.error);
    }
    return await usecases.convertTreeAsync(res.res, words);
  }
}


function buildDeps(): Deps {
  const env = new CliEnvironment();
  const registry = new Registry();
  registry.registerSCDialect(
    'zompist_sca1',
    langName => new ExecutableSoundChangeSet(ZompistSCADialect, langName, env)
  );
  return { env: env, registry: registry }
}

function prepTableFromResults(results: usecases.ConvertResults[]): { table: Object[], headers: string[] } {
  const headers = ['ancestor'].concat(results[0].results.map(x => x.langName));
  const table = results.map(x => Object.fromEntries([['ancestor', x.ancestor]].concat(x.results.map(r => [r.langName, r.result]))))
  return { headers: headers, table: table }
}


function printTable(table: Object[], headers: string[]) {
  cli.table(table, Object.fromEntries(headers.map(x => [x, {}])))
}
