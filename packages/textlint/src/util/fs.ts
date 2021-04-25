// LICENSE : MIT
"use strict";
import fs from "fs";

export function readFile(filePath: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        fs.readFile(filePath, "utf-8", (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
    });
}

export function readFileSync(filePath: string): string {
    return fs.readFileSync(filePath, "utf-8");
}
