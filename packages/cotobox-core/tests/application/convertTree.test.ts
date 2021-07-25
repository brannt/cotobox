import { ILanguageTreeRoot } from '../../src/types'
import { SoundChangeSet } from '../../src/domain/soundchangers/simplechangeset'
import { convertTree, convertTreeAsync, ConvertResults } from '../../src/application/convertTree'

const CommonCats = ['S=ptk', 'Z=bdg', 'N=mnñ', 'V=aeiou', 'C=ptkbdgmnñsr']

const setupTree = function (): { tree: ILanguageTreeRoot, wordlist: string[], expected: ConvertResults[] } {
    const soundChangesAyan = SoundChangeSet.fromZompFormatLines(
        ['S/Z/V_V', 'V//Z_#', 'd/r/#_'], CommonCats
    )
    const soundChangesBevan = SoundChangeSet.fromZompFormatLines(
        ['Z/N/N_', 'V//VC_C'], CommonCats
    )
    const soundChangesCean = SoundChangeSet.fromZompFormatLines(
        ['S//_S', 'a/o/_'], CommonCats
    )
    const tree: ILanguageTreeRoot = {
        name: 'protean',
        children: [
            {
                soundChanges: soundChangesAyan,
                name: 'ayan',
            },
            {
                soundChanges: soundChangesBevan,
                name: 'bevan',
                children: [
                    {
                        name: 'cean',
                        soundChanges: soundChangesCean,
                    }
                ]
            },
        ]
    }
    const wordlist = ['atepa', 'danda'];
    const expected = [
        {
            ancestor: 'atepa', results: [
                { langName: 'ayan', result: 'adeb' },
                { langName: 'bevan', result: 'atpa' },
                { langName: 'cean', result: 'opo' },
            ]
        },
        {
            ancestor: 'danda', results: [
                { langName: 'ayan', result: 'rand' },
                { langName: 'bevan', result: 'danna' },
                { langName: 'cean', result: 'donno' },
            ]
        },
    ]
    return { tree: tree, wordlist: wordlist, expected: expected }
}


test('simple tree', () => {
    const { tree, wordlist, expected } = setupTree();
    expect(convertTree(tree, wordlist)).toStrictEqual(expected)
})


test('simple tree async', async () => {
    const { tree, wordlist, expected } = setupTree();
    expect(await convertTreeAsync(tree, wordlist)).toStrictEqual(expected)
})
