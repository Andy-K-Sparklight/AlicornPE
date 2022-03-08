// Self Init
export declare function initClicornAPI(): Promise<void>;

// Dev
export declare function print(msg: string): Promise<void>;

// File System
export declare function openFile(path: string, mode: string): Promise<number>;
export declare function closeFile(fd: number): Promise<void>;
export declare function getFileSize(fd: number): Promise<number>;
export declare function readFile(fd: number): Promise<Buffer>;
export declare function writeFile(fd: number, data: Buffer): Promise<void>;
export declare function appendFile(fd: number, data: Buffer): Promise<void>;
export declare function getUserHome(): string;
export declare function ensureDir(pt: string): Promise<void>;
export declare function unZip(origin: string, dest: string): Promise<void>;
export declare function isFileExist(pt: string): Promise<boolean>;
export declare function readDirectory(pt: string): Promise<string[]>;
export declare function remove(pt: string): Promise<void>;
export declare function getModificationTime(pt: string): Promise<string>;
export declare function linkFile(origin: string, target: string): Promise<void>;
export declare function getSHA1(pt: string): Promise<string>;

// App
export declare function resize(w: number, h: number): Promise<void>;
export declare function openExternal(s: string): Promise<void>;

// Os
export declare function getOsType(): string;
export declare function spawnProc(cmd: string): Promise<number>;
export declare function getFreeMemory(): Promise<number>;
export declare function getTotalMemory(): Promise<number>;
export declare function chdir(pt: string): Promise<void>;

// Net
export declare function downloadFile(
  url: string,
  pt: string,
  timeout: number
): Promise<void>;

interface CResponse {
  status: number;
  body: Buffer;
}

export declare function netGet(
  url: string,
  headers: string,
  timeout: number
): Promise<CResponse>;

export declare function netPost(
  url: string,
  headers: string,
  body: string,
  timeout: number
): Promise<CResponse>;
