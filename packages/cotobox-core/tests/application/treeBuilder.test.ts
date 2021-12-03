import { ILanguageTreeRoot, ISoundChangeSet, ISystemEnvironment } from '../../src';
import { TreeBuilder } from '../../src/application/treeBuilder';
import { Registry } from '../../src/registry';

const TEST_TREEDEF = {
    "name": "protean",
    "soundchanges": { "default_dialect": "zompist_sca1" },
    "children": [
        { "name": "ayan", "soundchanges": { "file": "ayan1" } },
        {
            "name": "bevan",
            "children": [
                { "name": "cean", "soundchanges": { "dialect": "zompist_sca2" } }
            ]
        },
        { "name": "rimming", "soundchanges": { "file": "rimming1" } },
        { "name": "seadic", "soundchanges": { "file": "sead1" } }
    ]
}


class MockEnv implements ISystemEnvironment {
    workDir: string = '.';

    execProgram(): Promise<string> {
        return Promise.resolve('ok')
    }

    loadFile(): Promise<string> {
        return Promise.resolve('content')
    }

    writeFile(): Promise<void> {
        return Promise.resolve()
    }

    setWorkDir(): Promise<void> {
        return Promise.resolve()
    }

    deleteFile(): Promise<void> {
        return Promise.resolve()
    }
}
const registry = new Registry()

interface MockSCSet extends ISoundChangeSet {
    dialectName: string,
    langName: string,
}

function mockSC(dialectName: string, langName: string): MockSCSet {
    const mockApply = <T>(t: T) => t;
    return {
        dialectName: dialectName,
        langName: langName,
        apply: mockApply,
        applyToList: mockApply,
        applyToListAsync: t => Promise.resolve(mockApply(t))
    }
}

function setup() {
    for (const dialect of ['zompist_sca1', 'zompist_sca2', 'lexurgy']) {
        registry.registerSCDialect(dialect, langName => mockSC(dialect, langName))
    }
}


test('base tree', () => {
    setup()
    const res = new TreeBuilder(registry).build({
        "name": "protean"
    }, "zompist_sca1")
    if (res.ok === false) {
        throw new Error(`Failed to build tree: ${res.error}`);
    }
    else {
        const tree: ILanguageTreeRoot = res.res;
        expect(tree.name).toBe('protean');
    }
})


test('tree with children', () => {
    setup()
    const res = new TreeBuilder(registry).build({
        "name": "protean",
        "children": [{
            "name": "ayan"
        }]
    }, "zompist_sca1")
    if (res.ok === false) {
        throw new Error(`Failed to build tree: ${res.error}`);
    }
    else {
        const tree: ILanguageTreeRoot = res.res;
        expect(tree.name).toBe('protean');
        expect(tree.children).toBeDefined();
        expect(tree.children).toHaveLength(1);
        const child = tree.children![0];
        expect(child.name).toBe('ayan');
        const sc = child.soundChanges as MockSCSet
        expect(sc.dialectName).toBe('zompist_sca1')
        expect(sc.langName).toBe('ayan')
    }
})

test('override langname', () => {
    setup()
    const res = new TreeBuilder(registry).build({
        "name": "protean",
        "children": [{
            "name": "ayan",
            "soundchanges": { "name": "testfile" }
        }]
    }, "zompist_sca1")
    if (res.ok === false) {
        throw new Error(`Failed to build tree: ${res.error}`);
    }
    else {
        const sc = res.res.children![0].soundChanges as MockSCSet
        expect(sc.dialectName).toBe('zompist_sca1')
        expect(sc.langName).toBe('testfile')
    }
})

test('default dialect passing', () => {
    setup()
    const res = new TreeBuilder(registry).build({
        "name": "protean",
        "soundchanges": { "default_dialect": "zompist_sca1" },
        "children": [
            { "name": "should_have_default_from_root" },
        ]
    })
    if (res.ok === false) {
        throw new Error(`Failed to build tree: ${res.error}`);
    }
    else {
        const child = res.res.children![0];
        expect(child.name).toBe('should_have_default_from_root');
        const sc = child.soundChanges as MockSCSet
        expect(sc.dialectName).toBe('zompist_sca1')
    }
})


test('dialect override', () => {
    setup()
    const res = new TreeBuilder(registry).build({
        "name": "protean",
        "soundchanges": { "default_dialect": "zompist_sca1" },
        "children": [
            {
                "name": "should_override_dialect", "soundchanges": { "dialect": "lexurgy" }, "children": [
                    { "name": "should_have_default_back" }
                ]
            },
        ]
    })
    if (res.ok === false) {
        throw new Error(`Failed to build tree: ${res.error}`);
    }
    else {
        const child = res.res.children![0];
        expect(child.name).toBe('should_override_dialect');
        const sc = child.soundChanges as MockSCSet
        expect(sc.dialectName).toBe('lexurgy')

        const next_child = child.children![0];
        expect(next_child.name).toBe('should_have_default_back');
        const next_sc = next_child.soundChanges as MockSCSet
        expect(next_sc.dialectName).toBe('zompist_sca1')
    }
})


test('default override passing', () => {
    setup()
    const res = new TreeBuilder(registry).build({
        "name": "protean",
        "soundchanges": { "default_dialect": "zompist_sca1" },
        "children": [
            {
                "name": "should_override_dialect", "soundchanges": { "default_dialect": "lexurgy" }, "children": [
                    { "name": "should_keep_override" }
                ]
            },
        ]
    })
    if (res.ok === false) {
        throw new Error(`Failed to build tree: ${res.error}`);
    }
    else {
        const child = res.res.children![0];
        expect(child.name).toBe('should_override_dialect');
        const sc = child.soundChanges as MockSCSet
        expect(sc.dialectName).toBe('lexurgy')

        const next_child = child.children![0];
        expect(next_child.name).toBe('should_keep_override');
        const next_sc = next_child.soundChanges as MockSCSet
        expect(next_sc.dialectName).toBe('lexurgy')
    }
})
