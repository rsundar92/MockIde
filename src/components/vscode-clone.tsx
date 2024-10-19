'use client';

import React, { useState, useCallback, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useFileSystem } from '@/context/FileSystemContext';
import TreeView from './TreeView';
import MonacoEditorComponent from './MonacoEditorComponent';
import { useBranches } from '@/context/BranchesContext';
import { useOpenWorksheets } from '@/context/OpenWorksheetContext';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { Branch } from '@/types/type';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import 'react-reflex/styles.css';

export function MockIDE() {
  const { fileSystem, isLoadingFiles, updateFileSystem } = useFileSystem();
  const { currentBranch, setBranch, localBranches } = useBranches();
  const { activeWorksheets } = useOpenWorksheets();
  const [openFiles, setOpenFiles] = useState<{ path: string; content: string }[]>([]); // Stack of open files
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
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
      const existingFile = openFiles.find((file) => file.path === path);
      if (existingFile) {
        // If already open, switch to it
        setSelectedFile(existingFile.path);
        setFileContent(existingFile.content);
      } else {
        // Add to open files stack
        const newFile = {
          path,
          content: worksheet?.content || worksheet?.editorContent || worksheet?.modifiedContent || content,
        };
        setOpenFiles((prev) => [...prev, newFile]);
        setSelectedFile(newFile.path);
        setFileContent(newFile.content);
      }
    },
    [activeWorksheets, openFiles]
  );

  const closeFile = useCallback((path: string) => {
    setOpenFiles((prev) => prev.filter((file) => file.path !== path));
    if (selectedFile === path) {
      const nextFile = openFiles.find((file) => file.path !== path);
      setSelectedFile(nextFile ? nextFile.path : null);
      setFileContent(nextFile ? nextFile.content : '');
    }
  }, [openFiles, selectedFile]);

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
      setSelectedFile(null);
      setOpenFiles([]);
      updateFileSystem();
    }
  }, [currentBranch, updateFileSystem]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="p-4 border-b border-gray-200">
        {isLoadingFiles ? (
          <Skeleton height={40} width={'100%'} />
        ) : (
          <Select
            value={currentBranch}
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

        <div className="p-4 pb-0">
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
        </div>
      </div>

      <ReflexContainer orientation="vertical" className='bg-gray-900 text-white'>
        <ReflexElement minSize={200} flex={0.25}>
          <div className="">
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
        </ReflexElement>

        <ReflexSplitter />

        <ReflexElement flex={0.75}>
          <div className="flex-1 h-full">
            {openFiles.length > 0 &&
              <div className="flex space-x-2 p-2 bg-gray-800 text-white">
                {openFiles.map((file) => (
                  <div key={file.path} className="flex items-center">
                    <div
                      className={`px-2 py-1 rounded cursor-pointer ${
                        selectedFile === file.path ? 'bg-gray-700' : 'hover:bg-gray-600'
                      }`}
                      onClick={() => {
                        setSelectedFile(file.path);
                        setFileContent(file.content);
                      }}
                    >
                      {file.path.split('/').pop()}
                    </div>
                    <button
                      onClick={() => closeFile(file.path)}
                      className="ml-1 text-gray-400 hover:text-white"
                      aria-label="Close file"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
            }

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
        </ReflexElement>
      </ReflexContainer>
    </div>
  );
}
