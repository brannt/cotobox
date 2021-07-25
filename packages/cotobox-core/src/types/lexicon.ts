import { Word, IWordTransform, PartOfSpeech, ILanguage } from "./basic";

export interface ILexeme {
    word: Word;
    ancestor: string;
    applyTransform: (transform: IWordTransform) => ILexeme;
}

export interface ILexemeDefinition {
    partOfSpeech?: PartOfSpeech;
    definition?: string;
    wordForms?: string[];
}

export interface IDefinedLexeme extends ILexeme, ILexemeDefinition {}

export interface ILexicon {
    language: ILanguage;
    lexemes: IDefinedLexeme[];
}
