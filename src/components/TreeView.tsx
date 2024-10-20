'use client';

import React, { useCallback } from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import type { FileSystemItem } from '@/types/type';
import { useOpenWorksheets } from '@/context/OpenWorksheetContext';

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
  const { activeWorksheets } = useOpenWorksheets();

  const getContent = (path: string) => {
    const existingFile = activeWorksheets.find((file) => file.relativePath === path);
    return existingFile?.content || '';
  };

  return (
    <div>
      {files
        .filter((file: FileSystemItem) => file.depth === 0)
          .map((file: FileSystemItem) => {
            const renderTreeRecursively = (parent: FileSystemItem, depth = 0) => {
              const childFiles = files.filter(
                (f: FileSystemItem) =>
                  f.relativePath.startsWith(`${parent.relativePath}/`) &&
                  f.depth === depth + 1 &&
                  !f.relativePath.slice(parent.relativePath.length + 1).includes('/')
              );

              return (
                <div key={parent.relativePath}>
                  {parent.pathType === 'directory' && (
                    <>
                      <div
                        className="flex items-center cursor-pointer hover:bg-gray-800 py-1"
                        onClick={() => toggleFolder(parent.relativePath)}
                      >
                        {expandedFolders.includes(parent.relativePath) ? (
                          <ChevronDown className="w-4 h-4 mr-1" />
                        ) : (
                          <ChevronRight className="w-4 h-4 mr-1" />
                        )}
                        <Folder className="w-4 h-4 mr-2" />
                        {parent.name}
                      </div>
                      {expandedFolders.includes(parent.relativePath) && (
                        <div className="ml-4">
                          {childFiles.map((child) => renderTreeRecursively(child, depth + 1))}
                        </div>
                      )}
                    </>
                  )}

                  {parent.pathType === 'file' && (
                    <div
                      key={parent.relativePath}
                      className={`flex items-center cursor-pointer hover:bg-gray-800 py-1 ${
                        selectedFile === parent.relativePath ? 'bg-gray-700' : ''
                      }`}
                      onClick={() =>
                        selectFile(parent.relativePath, getContent(parent.relativePath))
                      }
                    >
                      <File className="w-4 h-4 mr-2" />
                      {parent.name}
                    </div>
                  )}
                </div>
              );
            };

            return renderTreeRecursively(file);
          })}
    </div>
  );
};

export default TreeView;
