export type FileSystemItem = {
    relativePath: string;
    name: string;
    pathType: 'directory' | 'file';
    depth: number;
    index: number;
    gitStatus: string | null;
    gitIgnored: boolean;
};
