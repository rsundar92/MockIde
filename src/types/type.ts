export type FileSystemItem = {
    relativePath: string;
    name: string;
    pathType: 'directory' | 'file';
    depth: number;
    index: number;
    gitStatus: string | null;
    gitIgnored: boolean;
};

export type Worksheet = {
    relativePath: string;
    name: string;
    pathType: 'file' | 'directory';
    depth: number;
    index: number;
    gitStatus: string | null;
    editorContent: string;
    modifiedContent: string;
    gitIgnored: boolean;
    worksheetType: 'git' | 'non-git';
    repositoryId: string;
    branch: string;
    role: string;
    warehouse: string;
    content: string;
};