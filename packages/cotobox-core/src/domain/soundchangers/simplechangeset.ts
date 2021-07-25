import type { ISoundChangeSet, Word, IWordTransform, ISystemEnvironment } from '../../types'
import { WordTransformHelper } from "../helpers"

class Categories {
    private readonly _cats: Map<string, string>;
    private readonly _allKeysRe: RegExp;

    constructor(categories: Map<string, string>) {
        this._cats = categories;
        const allKeys = Array.from(this._cats.keys()).join('');
        this._allKeysRe = new RegExp(this._anyCharRe(allKeys), 'g');
    }

    static fromZompFormat(categoryDefs: string[]) {
        const catsKV: [string, string][] = categoryDefs.map(cat => {
            const [k, v] = cat.split('=', 2);
            return [k, v]
        })
        return new Categories(new Map(catsKV));
    }

    private _anyCharRe(charlist: string): string {
        return `[${charlist}]`
    }

    substituteRe(reString: string): string {
        return reString.replace(this._allKeysRe, match => this._anyCharRe(this._cats.get(match)!))
    }

    matchBetweenCats(catFrom: string, catTo: string, char: string): string {
        // Returns a character at the same place in `catTo` as `char` is in `catFrom` if it can be accomplished
        // i.e. if both categories exist, `char` is in `catFrom` at an index that is within `catTo`'s length.
        // In all other cases returns `char` unchanged;
        const catFromChars = this._cats.get(catFrom);
        const catToChars = this._cats.get(catTo);
        if (catFromChars === undefined || catToChars === undefined) {
            return char
        }
        const charIndex = catFromChars.indexOf(char);
        return catToChars.charAt(charIndex) || char;
    }

    hasCat(category: string): boolean {
        return this._cats.has(category);
    }
}


export class SoundChangeRule implements IWordTransform {
    readonly from: string
    readonly to: string
    readonly condition: string
    readonly unless?: string
    readonly categories?: Categories
    private readonly _re: RegExp

    constructor(
        from: string, to: string, condition: string, unless?: string, categories?: Categories
    ) {
        this.from = from;
        this.to = to;
        this.condition = condition;
        this.unless = unless;
        this.categories = categories;
        this._re = this.compile();
    }

    static fromZompFormat(ruledef: string, categoryDefs?: Categories | string[]): SoundChangeRule {
        let categories: Categories | undefined;
        if (categoryDefs instanceof Categories) {
            categories = categoryDefs;
        } else if (Array.isArray(categoryDefs)) {
            categories = categoryDefs !== undefined ? Categories.fromZompFormat(categoryDefs) : undefined;
        }

        let [from, to, condition, unless] = ruledef.split('/');

        return new SoundChangeRule(from, to, condition, unless, categories)
    }

    compile(): RegExp {
        let [precond, postcond] = this.condition.split('_');
        let from = this.from;

        // replace categories
        if (this.categories !== undefined) {
            precond = this.categories.substituteRe(precond);
            postcond = this.categories.substituteRe(postcond);
            from = this.categories.substituteRe(from);
        }

        const escapeRegExp = (s: string) => {
            return s.replace(/[.*+?^${}|\\]/g, '\\$&')
        }
        precond = escapeRegExp(precond);
        postcond = escapeRegExp(postcond);
        from = escapeRegExp(from);

        // replace boundaries
        if (precond.startsWith("#")) {
            precond = precond.replace("#", "^")
        }
        if (postcond.endsWith("#")) {
            postcond = postcond.replace("#", "$")
        }

        // replace optionals
        const replaceOptionals = (s: string) => s.replace(/\(.+\)/i, '$&?');
        precond = replaceOptionals(precond);
        postcond = replaceOptionals(postcond);

        let reString = `(?<=${precond})(${from})(?=${postcond})`;
        // console.log(reString);
        return new RegExp(reString, 'g')
    }

    apply(word: Word): Word {
        if (this.categories !== undefined && this.categories.hasCat(this.from) && this.categories.hasCat(this.to)) {
            const categories = this.categories;
            return word.replace(this._re, substr => categories.matchBetweenCats(this.from, this.to, substr))
        }
        return word.replace(this._re, this.to)
    }

    applyToList = WordTransformHelper.applyToList;
    applyToListAsync = WordTransformHelper.applyToListAsync;
}


export class SoundChangeSet implements ISoundChangeSet {
    private readonly _rules: SoundChangeRule[]
    private readonly _categories?: Categories

    private constructor(rules: SoundChangeRule[], categories?: Categories) {
        this._categories = categories;
        this._rules = rules;
    }

    apply(word: Word): Word {
        const reducer = (w: Word, r: SoundChangeRule) => r.apply(w)
        return this._rules.reduce(reducer, word)
    }

    static fromZompFormatLines(ruledefs: string[], categoryDefs?: string[]): SoundChangeSet {
        const categories = categoryDefs !== undefined ? Categories.fromZompFormat(categoryDefs) : undefined
        const rules = ruledefs.map((r) => SoundChangeRule.fromZompFormat(r, categories))
        return new SoundChangeSet(rules, categories)
    }

    static fromFiles(langName: string, env: ISystemEnvironment): SoundChangeSet {

        return SoundChangeSet.fromZompFormatLines([])
    }

    applyToList = WordTransformHelper.applyToList;
    applyToListAsync = WordTransformHelper.applyToListAsync;
}
