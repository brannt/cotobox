import { SoundChangeRule, SoundChangeSet } from '../../src/domain/soundchangers/simplechangeset'


test.each([
    ['unconditional rule', 'a/o/_', 'ara', 'oro'],
    ['unconditional rule not met', 'a/b/_', 'ere', 'ere'],
    ['condition rule after', 't/c/_i', 'atia', 'acia'],
    ['condition rule after not met', 't/c/_i', 'aita', 'aita'],
    ['condition rule before', 's/x/r_', 'ursu', 'urxu'],
    ['condition rule before not met', 's/x/r_', 'ulsu', 'ulsu'],
    ['condition rule between', 'i/y/d_o', 'adios', 'adyos'],
    ['condition rule between not met', 'i/y/d_o', 'atios', 'atios'],
    ['condition rule onset', 'i/y/#_', 'ios', 'yos'],
    ['condition rule onset not met', 'i/y/#_', 'atios', 'atios'],
    ['condition rule coda', 'd/t/_#', 'cad', 'cat'],
    ['condition rule coda not met', 'd/t/_#', 'cada', 'cada'],
    ['condition rule complex', 'o/u/#r_d#', 'rod', 'rud'],
    ['condition rule complex not met', 'o/u/#r_d#', 'kroda', 'kroda'],
    ['condition rule multimatch', 'o/u/r_d', 'rodgodrod', 'rudgodrud'],
    ['deletion rule', 'a//s_v', 'asava', 'asva'],
    ['insertion rule', '/g/n_r', 'inri', 'ingri'],
    ['optional in postcondition found', 'a/e/_(d)i', 'adi', 'edi'],
    ['optional in postcondition not found', 'a/e/_(d)i', 'ai', 'ei'],
    ['optional in precondition found', 'a/e/#(y)_', 'yar', 'yer'],
    ['optional in precondition not found', 'a/e/#(y)_', 'ar', 'er'],
    ['special chars', '?/$/_@', '?@r', '$@r']
])('Simple rules: %s', (name: string, ruledef: string, word: string, expected: string) => {
    let rule = SoundChangeRule.fromZompFormat(ruledef)
    expect(rule.apply(word)).toBe(expected)
})


test.each([
    ['Categories in rule', 'S/Z/_', 'apata', 'abada', ['S=ptk', 'Z=bdg']],
    ['Categories in condition', 'S/Z/V_V', 'uteko', 'udego', ['S=ptk', 'Z=bdg', 'V=aeiou']],
    ['Change category to simple', 'V/a/S_S', 'uteko', 'utako', ['S=ptk', 'Z=bdg', 'V=aeiou']],
    ['Categories deletion', 'Z//V_V', 'udego', 'ueo', ['V=aeiou', 'Z=bdg']],
    ['Categories in found optional', 'u/ü/_S(S)F', 'upti', 'üpti', ['S=ptk', 'F=ei']],
    ['Categories in not found optional', 'u/ü/_S(S)F', 'upi', 'üpi', ['S=ptk', 'F=ei']],
    ['Categories with special chars', '$/*/_$', "`~^'", "a~a'", ["$=`'^~", '*=aaa']],
])('Rules with categories: %s', (name: string, ruledef: string, word: string, expected: string, categoryDefs: string[]) => {
    let rule = SoundChangeRule.fromZompFormat(ruledef, categoryDefs)
    expect(rule.apply(word)).toBe(expected)
})


test('latin to portuguese', () => {
    const portugueseRuleset = SoundChangeSet.fromZompFormatLines(
        [
            "[sm]//_#",
            "i/j/_V",
            "L/V/_",
            "e//Vr_#",
            "v//V_V",
            "u/o/_#",
            "gn/nh/_",
            "S/Z/V_V",
            "c/i/F_t",
            "c/u/B_t",
            "p//V_t",
            "ii/i/_",
            "e//C_rV",
        ],
        [
            "V=aeiou",
            "L=āēīōū",
            "C=ptcqbdgmnlrhs",
            "F=ie",
            "B=ou",
            "S=ptc",
            "Z=bdg",
        ]
    )
    const lexicon = [
        "lector", "doctor", "focus", "jocus", "districtus", "cīvitatem", "adoptare", "opera", "secundus", "fīliam", "pōntem"
    ]
    expect(lexicon.map(portugueseRuleset.apply.bind(portugueseRuleset))).toStrictEqual(
        [
            "leitor", "doutor", "fogo", "jogo", "distrito", "cidade", "adotar", "obra", "segundo", "filja", "ponte"
        ]
    )

})
