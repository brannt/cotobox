import type { ILexeme, IWordTransform, Word } from "../types";


export const WordTransformHelper = {
    applyToList: function (this: IWordTransform, wordlist: Word[]): Word[] {
        return wordlist.map(this.apply.bind(this))
    },

    applyToListAsync: function (this: IWordTransform, wordlist: Word[]): Promise<Word[]> {
        return Promise.resolve(this.applyToList.bind(this, wordlist)());
    }
}


export function applyTransformToLexeme(this: ILexeme, transform: IWordTransform): ILexeme {
    return { ...this, word: transform.apply(this.word), ancestor: this.word };
}
