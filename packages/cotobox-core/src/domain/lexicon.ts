import { ILexeme, Word, PartOfSpeech } from "../types";
import { applyTransformToLexeme } from "./helpers"

export class Lexeme implements ILexeme {
    word: Word;
    ancestor: string = "";

    constructor(word: Word) {this.word = word;}

    applyTransform = applyTransformToLexeme;
}


export class DefinedLexeme extends Lexeme {
    partOfSpeech?: PartOfSpeech;
    definition?: string;
    wordForms?: string[];
}
