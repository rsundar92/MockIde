'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFileSystem } from '@/context/FileSystemContext';
import TreeView from './TreeView';
import MonacoEditorComponent from './MonacoEditorComponent';
import { useBranches } from '@/context/BranchesContext';
import { useOpenWorksheets } from '@/context/OpenWorksheetContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Branch } from '@/types/type';

export function MockIDE() {
  const { fileSystem, isLoadingFiles, error, updateFileSystem } = useFileSystem();
  const {currentBranch, setBranch, localBranches } = useBranches();
  const { activeWorksheets } = useOpenWorksheets();
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [diffMode, toggleDiffMode] = useState(false);

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

  useEffect(() => {
    if (currentBranch) {
      setSelectedFile('');
      updateFileSystem();
    }
  }, [currentBranch, updateFileSystem]);

  if (error) {
    return <div>Error loading files!</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="p-4 border-b border-gray-200">
        {isLoadingFiles ? (
          <Skeleton height={40} width={'100%'} />
        ) : (
          <Select value={currentBranch}
            onValueChange={(value: string) => setBranch(value as Branch)}
          >
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
      <button
        onClick={() => toggleDiffMode(!diffMode)}
        className={`px-4 py-2 rounded-md font-semibold transition duration-300 ${
          diffMode
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
      >
        {diffMode ? 'Switch to Editor' : 'Show Diff'}
      </button>
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
              {Array.from({ length: 10 }, (_, index) => (
                <Skeleton key={index} height="100%" />
              ))}
            </div>
          ) : selectedFile ? (
            <MonacoEditorComponent
              value={fileContent}
              onChange={handleEditorChange}
              selectedFile={selectedFile}
              openworksheets={activeWorksheets}
              diffMode={diffMode}
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
