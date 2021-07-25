import type { ISoundChangeSet, Word } from "../../types"
import type { ISystemEnvironment } from "../../types/systemenv"
import { waitForPromise } from "../../lib/utils"


export interface SoundChangerDialect {
    executable: string;
    lexiconExt: string;
    soundChangesExt: string;
    outExt: string;
    encoding: 'utf-8' | 'latin1';

    buildArgs: (inFile: string, langName: string) => [string, string[]];
}

export const ZompistSCADialect: SoundChangerDialect = {
    executable: 'sounds',
    lexiconExt: 'lex',
    soundChangesExt: 'sc',
    outExt: 'out',
    encoding: 'latin1',

    buildArgs(inFile: string, langName: string): [string, string[]] {
        return [this.executable, [inFile, langName, '-l']];
    }
}

export class ExecutableSoundChangeSet implements ISoundChangeSet {
    private readonly _dialect: SoundChangerDialect;
    readonly langName: string;
    private readonly _env: ISystemEnvironment;

    constructor(dialect: SoundChangerDialect, langName: string, env: ISystemEnvironment) {
        this.langName = langName;
        this._dialect = dialect;
        this._env = env;
    }

    getDialect(): SoundChangerDialect {
        return this._dialect
    }

    apply(word: Word): Word {
        return this.applyToList([word])[0]
    }

    applyToListAsync(wordList: Word[]): Promise<Word[]> {
        const fnameBase = Math.random().toString(16).substr(2, 8);
        const fname = fnameBase + '.' + this._dialect.lexiconExt;
        const env = this._env;
        // SCA2 expects new line at the end of file
        return env.writeFile(fname, wordList.join('\n') + '\n', this._dialect.encoding)
            .then(() => {
                return env.execProgram(...this._dialect.buildArgs(fnameBase, this.langName))
            })
            .then(() => {
                return env.loadFile(this.langName + '.' + this._dialect.outExt, this._dialect.encoding)
            })
            .then(fileContent => fileContent.split('\n').filter(l => l != ''))
            .catch((reason) => { throw new Error(reason) })
            .finally(() => env.deleteFile(fname))
    }

    applyToList(wordList: Word[]): Word[] {
        return waitForPromise(this.applyToListAsync(wordList));
    }

    static bindToDialect(dialect: SoundChangerDialect): typeof ExecutableSoundChangeSet {
        return ExecutableSoundChangeSet.constructor.apply(dialect)
    }
}
