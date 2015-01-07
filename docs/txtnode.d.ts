declare module TxtSyntax {
    // Node
    interface TxtNode {
        type:string;
        raw?:string;
        range?: number[]
        loc:LineLocation;
        parent?:TxtNode;
        children?: TxtNode[];
    }
    interface LineLocation {
        start: Position
        end: Position
    }
    interface Position {
        line: number
        column: number
    }
}