declare module TxtParse {

    module TxtSyntax {
        // Node
        interface TxtNode {
            type:string;
            raw?:string;
            loc:LineLocation;
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

}