export type TextlintRcConfig = {
    plugins?:
        | string[]
        | {
              [index: string]: boolean | object;
          };
    filters?: {
        [index: string]: boolean | object;
    };
    rules?: {
        [index: string]: boolean | object;
    };
};
