
export type Result<T> = { ok: true, res: T } | { ok: false, error: string }

export type Class<T> = {
    new(...args: any[]): T;
}

export type Word = string;

export enum PartOfSpeech {
    Noun = "n",
    NounActive = "na",
    NounNeuter = "nn",
    Numeral = "num",
    Verb = "v",
}

export interface ILanguage {
    name: string;
}

export interface IWordTransform {
    apply(word: Word): Word;
    applyToList(wordlist: Word[]): Word[];
    applyToListAsync(wordlist: Word[]): Promise<Word[]>;
}
