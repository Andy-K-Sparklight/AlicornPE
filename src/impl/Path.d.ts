export declare function initPaths(): Promise<void>;
export declare function pathJoin(...paths: string[]): string;
export declare function pathDirname(pt: string): string;
export declare function pathBasename(pt: string, ext?: string): string;
export declare function pathIsAbsolute(pt: string): boolean;
export declare function pathDelimiter(): string;
export declare function pathNormalize(pt: string): string;
export declare function pathExtName(pt: string): string;
