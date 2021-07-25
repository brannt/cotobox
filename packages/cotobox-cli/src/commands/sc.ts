import { Command, flags } from '@oclif/command'
import { ExecutableSoundChangeSet, ZompistSCADialect } from 'cotobox-core'
import { CliEnvironment } from '../systemenv'

export default class SoundChange extends Command {
  static description = 'Apply sound changes to lexicon'

  static examples = [
    `$ ctb sc protean beyan
`,
  ]

  static flags = {
    help: flags.help({ char: 'h' }),
    workdir: flags.string(),
  }

  static args = [{ name: 'langFrom' }, { name: 'langTo' }]

  async run() {
    const { args, flags } = this.parse(SoundChange);
    const env = new CliEnvironment();
    if (flags.workdir) {
      env.workDir = flags.workdir;
    }
    env.setWorkDir();
    const dialect = ZompistSCADialect;
    const changer = new ExecutableSoundChangeSet(dialect, args.langTo, env);
    const list = await env.loadFile(`${args.langFrom}.${dialect.lexiconExt}`);
    console.log(await changer.applyToListAsync(list.split('\n')));
  }
}
