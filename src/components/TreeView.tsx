'use client';

import React, { useCallback } from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import type { FileSystemItem } from '@/types/type';

type TreeViewProps = {
  files: FileSystemItem[];
  expandedFolders: string[];
  toggleFolder: (path: string) => void;
  selectedFile: string | null;
  selectFile: (path: string, content: string) => void;
};

const TreeView: React.FC<TreeViewProps> = ({
  files,
  expandedFolders,
  toggleFolder,
  selectedFile,
  selectFile,
}) => {
  const renderTree = useCallback(
    (files: FileSystemItem[], depth = 0, parentPath = '') => {
      if (!files) {
        return null;
      }
      const currentLevelFiles = files.filter((file: FileSystemItem) => {
        const isDirectChild =
          file.relativePath.startsWith(parentPath) &&
          file.depth === depth &&
          !file.relativePath.slice(parentPath.length + 1).includes('/'); // Ensure no deeper subdirectory
        return isDirectChild;
      });

      return currentLevelFiles.map((file: FileSystemItem) => {
        const hasChildren = files.some(
          (f: FileSystemItem) =>
            f.relativePath.startsWith(`${file.relativePath}/`) &&
            f.depth === depth + 1
        );

        if (file.pathType === 'directory') {
          return (
            <div key={file.relativePath}>
              <div
                className="flex items-center cursor-pointer hover:bg-gray-800 py-1"
                onClick={() => toggleFolder(file.relativePath)}
              >
                {expandedFolders.includes(file.relativePath) ? (
                  <ChevronDown className="w-4 h-4 mr-1" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-1" />
                )}
                <Folder className="w-4 h-4 mr-2" />
                {file.name}
              </div>
              {expandedFolders.includes(file.relativePath) && hasChildren && (
                <div className="ml-4">
                  {renderTree(files, depth + 1, file.relativePath)}
                </div>
              )}
            </div>
          );
        } else if (file.pathType === 'file') {
          return (
            <div
              key={file.relativePath}
              className={`flex items-center cursor-pointer hover:bg-gray-800 py-1 ${
                selectedFile === file.relativePath ? 'bg-gray-700' : ''
              }`}
              onClick={() => selectFile(file.relativePath, file.name || '')}
            >
              <File className="w-4 h-4 mr-2" />
              {file.name}
            </div>
          );
        }

        return null;
      });
    },
    [expandedFolders, selectedFile, toggleFolder, selectFile]
  );

  return <div>{renderTree(files)}</div>;
};

export default TreeView;
