import { Registry } from "../registry";
import { ILanguageTreeNode, ILanguageTreeRoot, Result } from "../types";

type DialectDef = string;

interface SCDef {
    dialect?: DialectDef
    default_dialect?: DialectDef
    name?: string
}

interface TreeDef {
    name: string
    children?: TreeDef[]
    soundchanges?: SCDef
}

export class TreeBuilder {
    private _registry: Registry;

    constructor(registry?: Registry) {
        this._registry = registry || Registry.getDefaultInstance()
    }

    private _buildNode(treedef: TreeDef, defaultDialect?: DialectDef): Result<ILanguageTreeNode> {
        defaultDialect = treedef.soundchanges?.default_dialect || defaultDialect;
        const dialect = treedef.soundchanges?.dialect || defaultDialect;
        if (!dialect) {
            return { ok: false, error: "No dialect defined" }
        }

        const handler = this._registry.tryGetSCDialectHandler(dialect);
        if (!handler.ok) return handler;

        const scName = treedef.soundchanges?.name || treedef.name;
        const node: ILanguageTreeNode = {
            name: treedef.name,
            soundChanges: handler.res(scName),
        }

        if (typeof treedef.children !== 'undefined') {
            node.children = [];

            for (const child of treedef.children) {
                const res = this._buildNode(child, defaultDialect);
                if (!res.ok) return res;
                node.children.push(res.res);
            }
        }
        return {
            ok: true,
            res: node
        }
    }

    build(treedef: TreeDef, defaultDialect?: DialectDef): Result<ILanguageTreeRoot> {
        defaultDialect = treedef.soundchanges?.default_dialect || defaultDialect;

        const node: ILanguageTreeRoot = {
            name: treedef.name,
        }

        if (typeof treedef.children !== 'undefined') {
            node.children = [];

            for (const child of treedef.children) {
                const res = this._buildNode(child, defaultDialect);
                if (!res.ok) return res;
                node.children.push(res.res);
            }
        }
        return {
            ok: true,
            res: node
        }
    }
}
