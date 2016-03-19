declare module TxtAST {
    // Node
    interface TxtNode {
        type: string;
        raw: string;
        range: [number, number];
        loc: LineLocation;
        // parent is runtime information
        // Not need in AST
        parent?: TxtNode;
    }
    // Inline Node
    interface TxtTextNode extends TxtNode {
        value: string
    }
    // Parent Node
    interface TxtParentNode extends TxtNode {
        children: TxtNode[] | TxtTextNode[];
    }
    interface LineLocation {
        start: Position;
        end: Position;
    }
    interface Position {
        line: number; // start with 1
        column: number;// start with 0
        // This is for compatibility with JavaScript AST.
        // https://gist.github.com/azu/8866b2cb9b7a933e01fe
    }
}
