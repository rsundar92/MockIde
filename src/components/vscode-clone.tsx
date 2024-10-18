'use client';

import React, { useState, useCallback } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFileSystem } from '@/context/FileSystemContext';
import TreeView from './TreeView';
import MonacoEditorComponent from './MonacoEditorComponent';
import { useBranches } from '@/context/BranchesContext';
import { useOpenWorksheets } from '@/context/OpenWorksheets';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

export function MockIDE() {
  const { fileSystem, isLoadingFiles, error, updateFileSystem } = useFileSystem();
  const { localBranches } = useBranches();
  const { activeWorksheets } = useOpenWorksheets();
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  }, []);

  const selectFile = useCallback(
    (path: string, content: string) => {
      const worksheet = activeWorksheets.find((worksheet) => worksheet.relativePath === path);
      setSelectedFile(path);
      setFileContent(
        worksheet?.content || worksheet?.editorContent || worksheet?.modifiedContent || content
      );
    },
    [activeWorksheets]
  );

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined && selectedFile) {
        setFileContent(value);
        updateFileSystem();
      }
    },
    [selectedFile, updateFileSystem]
  );

  if (error) {
    return <div>Error loading files!</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="p-4 border-b border-gray-200">
        {isLoadingFiles ? (
          <Skeleton height={40} width={200} />
        ) : (
          <Select value={currentBranch} onValueChange={setCurrentBranch}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {localBranches.map((branch) => (
                <SelectItem key={branch} value={branch}>
                  {branch}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-gray-200 overflow-auto">
          <div className="p-4">
            {isLoadingFiles ? (
              <Skeleton count={5} height={20} style={{ marginBottom: '10px' }} />
            ) : (
              <TreeView
                files={fileSystem.files}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
                selectedFile={selectedFile}
                selectFile={selectFile}
              />
            )}
          </div>
        </div>
        <div className="flex-1">
          {isLoadingFiles ? (
            <div className="p-4">
              <Skeleton height="100%" />
            </div>
          ) : selectedFile ? (
            <MonacoEditorComponent
              value={fileContent}
              onChange={handleEditorChange}
              selectedFile={selectedFile}
              openworksheets={activeWorksheets}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Select a file to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
