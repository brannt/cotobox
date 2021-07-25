import { ILanguage, IWordTransform, Word } from "./basic";

export interface ISoundChangeSet extends IWordTransform { }

export interface IWordTemplate extends IWordTransform {
    template: string;
    definition: string;
}

export interface ILanguageTreeRoot extends ILanguage {
    children?: ILanguageTreeNode[];
}

export interface ILanguageTreeNode extends ILanguageTreeRoot {
    soundChanges: ISoundChangeSet;
}
