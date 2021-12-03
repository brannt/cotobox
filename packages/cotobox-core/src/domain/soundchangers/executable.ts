import { waitForPromise } from "../../lib/utils";
import type { ISoundChangeSet, Word } from "../../types";
import type { ISystemEnvironment } from "../../types/systemenv";


export interface IExecutor {
    runOnList: (wordList: Word[]) => Promise<Word[]>
}

export interface ISoundChangerDialect {
    executable: string;
    lexiconExt: string;
    soundChangesExt: string;
    outExt: string;
    encoding: 'utf-8' | 'latin1';
    executorClass: {new(dialect: ISoundChangerDialect, langName: string, env: ISystemEnvironment): IExecutor};

    buildArgs: (inFile: string, langName: string) => [string, string[]];
}

export class FileExecutor implements IExecutor {
    private readonly _dialect: ISoundChangerDialect;
    private readonly _langName: string;
    private readonly _env: ISystemEnvironment;

    constructor(dialect: ISoundChangerDialect, langName: string, env: ISystemEnvironment) {
        this._langName = langName;
        this._dialect = dialect
        this._env = env
    }

    runOnList(wordList: Word[]): Promise<Word[]> {
        const fnameBase = Math.random().toString(16).substr(2, 8);
        const fname = fnameBase + '.' + this._dialect.lexiconExt;
        const env = this._env;
        // SCA2 expects new line at the end of file
        return env.writeFile(fname, wordList.join('\n') + '\n', this._dialect.encoding)
            .then(() => {
                return env.execProgram(...this._dialect.buildArgs(fnameBase, this._langName))
            })
            .then(() => {
                return env.loadFile(this._langName + '.' + this._dialect.outExt, this._dialect.encoding)
            })
            .then(fileContent => fileContent.split('\n').filter(l => l != ''))
            .catch((reason) => { throw new Error(reason) })
            .finally(() => env.deleteFile(fname))
    }
}


export const ZompistSCADialect: ISoundChangerDialect = {
    executable: 'sounds',
    lexiconExt: 'lex',
    soundChangesExt: 'sc',
    outExt: 'out',
    encoding: 'latin1',
    executorClass: FileExecutor,

    buildArgs(inFile: string, langName: string): [string, string[]] {
        return [this.executable, [inFile, langName, '-l']];
    }
}

export class ExecutableSoundChangeSet implements ISoundChangeSet {
    private readonly _dialect: ISoundChangerDialect;
    readonly langName: string;
    private readonly _executor: IExecutor;

    constructor(dialect: ISoundChangerDialect, langName: string, env: ISystemEnvironment) {
        this.langName = langName;
        this._dialect = dialect;
        this._executor = new dialect.executorClass(dialect, langName, env);
    }

    getDialect(): ISoundChangerDialect {
        return this._dialect
    }

    apply(word: Word): Word {
        return this.applyToList([word])[0]
    }

    applyToListAsync(wordList: Word[]): Promise<Word[]> {
        return this._executor.runOnList(wordList)
    }

    applyToList(wordList: Word[]): Word[] {
        return waitForPromise(this.applyToListAsync(wordList));
    }

    static bindToDialect(dialect: ISoundChangerDialect): typeof ExecutableSoundChangeSet {
        return ExecutableSoundChangeSet.constructor.apply(dialect)
    }
}
