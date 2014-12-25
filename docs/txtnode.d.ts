declare module  TxtNode {
    var type:string;
    var raw:string;
    var loc:LineLocation;
    interface LineLocation {
        start: Position
        end: Position
    }
    interface Position {
        line: number
        column: number
    }

}