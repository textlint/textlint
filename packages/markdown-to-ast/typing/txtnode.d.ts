declare module TxtParse {

    module TxtSyntax {
        // Node
        interface TxtNode {
            type:string;
            raw?:string;
            children?: TxtNode[];
            range:[number,number];
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