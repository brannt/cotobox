import { ISoundChangeSet, Result } from "./types";


type SoundChangerFactory = (langName: string, ...args: any) => ISoundChangeSet

export class Registry {
    private static _defaultInstance: Registry
    private _scDialects: Map<string, SoundChangerFactory>;

    constructor() {
        this._scDialects = new Map();
    }

    static getDefaultInstance(): Registry {
        if (!Registry._defaultInstance) {
            Registry._defaultInstance = new Registry();
        }
        return Registry._defaultInstance
    }

    registerSCDialect(dialect: string, handler: SoundChangerFactory) {
        this._scDialects.set(dialect, handler);
    }

    tryGetSCDialectHandler(dialect: string): Result<SoundChangerFactory> {
        const res = this._scDialects.get(dialect);
        if (typeof res === 'undefined') {
            return { ok: false, error: `Unknown dialect ${dialect}` }
        }
        return { ok: true, res: res }
    }
}
