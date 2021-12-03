import { Command, flags } from '@oclif/command'
import cli from 'cli-ux'
import type { ISystemEnvironment } from 'cotobox-core'
import { ExecutableSoundChangeSet, Registry, usecases, ZompistSCADialect } from 'cotobox-core'
import * as fs from "fs"
import { CliEnvironment } from '../systemenv'



interface Deps { env: ISystemEnvironment, registry: Registry }
export default class ScTree extends Command {
  static description = 'describe the command here';
  static strict = false;

  static flags = {
    help: flags.help({ char: 'h' }),
    workdir: flags.string(),
    file: flags.string({char: 'f'}),
    encoding: flags.string({char: 'e', default: 'utf-8'}),
    languages: flags.string({char: 'l'}),
  }

  static args = [{ name: 'word' }];

  private deps: Deps = buildDeps();
  private languagesToFilter?: string[];

  async run() {
    let { words } = this.handleArgs()
    if (!words.length) {
      words = await this.inputWords();
    }

    const results = await this.scTree(words);

    const { table, headers } = prepTableFromResults(results, this.languagesToFilter)
    printTable(table, headers)
  }

  handleArgs(): { words: string[] } {
    const { argv, flags } = this.parse(ScTree);


    if (flags.workdir) {
      this.deps.env.setWorkDir(flags.workdir);
    }

    this.languagesToFilter = flags.languages?.split(',');

    if (flags.file) {
      // read from stdin if '-' is passed
      let fileName = flags.file == '-' ? process.stdin.fd : flags.file;
      let content = fs.readFileSync(fileName, {encoding: flags.encoding as BufferEncoding}).toString();
      return { words : content.split('\n').filter(l => l != '') }
    }

    return { words: argv.slice()}
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

  async scTree(words: string[]): Promise<usecases.ConvertResults[]> {
    const treeBuilder = new usecases.TreeBuilder(this.deps.registry);

    const treedef = JSON.parse(await this.deps.env.loadFile('tree.ctb.json', 'utf-8'));
    const res = treeBuilder.build(treedef);
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

function prepTableFromResults(results: usecases.ConvertResults[], languagesToFilter?: string[]): { table: Object[], headers: string[] } {
  let flt: (r: usecases.SingleConvertResult) => boolean = r => true;
  if (languagesToFilter) {
    flt = r => languagesToFilter.indexOf(r.langName) !== -1
  }
  const headers = ['ancestor'].concat(results[0].results.filter(flt).map(x => x.langName));
  const table = results.map(x => Object.fromEntries([['ancestor', x.ancestor]].concat(x.results.filter(flt).map(r => [r.langName, r.result]))))
  return { headers: headers, table: table }
}


function printTable(table: Object[], headers: string[]) {
  cli.table(table, Object.fromEntries(headers.map(x => [x, {}])))
}
