import type { ILanguageTreeNode, ILanguageTreeRoot, Word } from '../types';


export type SingleConvertResult = { langName: string, result: Word };

export type ConvertResults = {
    ancestor: Word;
    results: SingleConvertResult[];
}

function convertNode(node: ILanguageTreeNode | ILanguageTreeRoot, wordlist: Word[]): SingleConvertResult[][] {
    let changedWordlist: Word[] = wordlist;
    let result: SingleConvertResult[][] = Array.from(wordlist, () => <SingleConvertResult[]>[]);

    const mergeToResult = (l: SingleConvertResult[][]): void => {
        l.forEach((w, i) => { result[i].push(...w) })
    }

    if ("soundChanges" in node) {
        changedWordlist = node.soundChanges.applyToList(wordlist);
        mergeToResult(changedWordlist.map(w => [{ langName: node.name, result: w }]))
    }
    if (node.children !== undefined) {
        for (const c of node.children) {
            mergeToResult(convertNode(c, changedWordlist))
        }
    }
    return result
}


export function convertTree(tree: ILanguageTreeRoot, wordlist: Word[]): ConvertResults[] {
    let result = convertNode(tree, wordlist);

    return wordlist.map((w, i) => { return { ancestor: w, results: result[i] } })
}


async function convertNodeAsync(node: ILanguageTreeNode | ILanguageTreeRoot, wordlist: Word[]): Promise<SingleConvertResult[][]> {
    let changedWordlist: Word[] = wordlist;
    let result: SingleConvertResult[][] = Array.from(wordlist, () => <SingleConvertResult[]>[]);

    const mergeToResult = (l: SingleConvertResult[][]): void => {
        l.forEach((w, i) => { result[i].push(...w) })
    }

    if ("soundChanges" in node) {
        changedWordlist = await node.soundChanges.applyToListAsync(wordlist);
        mergeToResult(changedWordlist.map(w => [{ langName: node.name, result: w }]))
    }
    if (node.children !== undefined) {
        const promises = node.children.map(c => convertNodeAsync(c, changedWordlist))
        const results = await Promise.all(promises);
        results.forEach(r => mergeToResult(r));
    }
    return result
}

export async function convertTreeAsync(tree: ILanguageTreeRoot, wordlist: Word[]): Promise<ConvertResults[]> {
    let result = await convertNodeAsync(tree, wordlist);

    return wordlist.map((w, i) => { return { ancestor: w, results: result[i] } })
}
