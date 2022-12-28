export type TextlintRcConfig = {
    plugins?:
        | string[]
        | {
              [index: string]: boolean | {};
          };
    filters?: {
        [index: string]: boolean | {};
    };
    rules?: {
        [index: string]: boolean | {};
    };
};
