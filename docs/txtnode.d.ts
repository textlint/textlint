declare module TxtSyntax {
    // Node
    interface TxtNode {
        type:string;
        raw?:string;
        value?:string;
        range?: number[]
        loc:LineLocation;
        parent?:TxtNode;
        children?: TxtNode[];
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