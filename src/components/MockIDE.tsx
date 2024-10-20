'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useFileSystem } from '@/context/FileSystemContext';
import TreeView from './TreeView';
import MonacoEditorComponent from './MonacoEditorComponent';
import { useOpenWorksheets } from '@/context/OpenWorksheetContext';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';
import { IDEHeader } from './IDEHeader';
import 'react-reflex/styles.css';
import 'react-loading-skeleton/dist/skeleton.css';
import { useBranches } from '@/context/BranchesContext';
import Skeleton from 'react-loading-skeleton';
import { Button } from './ui/button';

export function MockIDE() {
  const { fileSystem, isLoadingFiles, updateFileSystem } = useFileSystem();
  const { activeWorksheets } = useOpenWorksheets();
  const [openFiles, setOpenFiles] = useState<{ path: string; content: string }[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [diffMode, toggleDiffMode] = useState(false);
  const {currentBranch} = useBranches();

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
        // updateFileSystem();
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
      <IDEHeader />

      <ReflexContainer orientation="vertical" className="bg-gray-900 text-white">
        <ReflexElement minSize={200} flex={0.25}>
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
        </ReflexElement>

        <ReflexSplitter style={{'zIndex': 0}}/>

        <ReflexElement flex={0.75}>
        <div className="flex-1 h-full">
          {openFiles.length > 0 && (
            <div className="flex items-center justify-between p-2 bg-gray-800 text-white">
              <div className="flex space-x-2">
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

              {/* Aligning the button to the right */}
              <div className="ml-auto">
                <Button
                  onClick={() => toggleDiffMode(!diffMode)}
                  className={'text-black'}
                  variant={'outline'}
                >
                  {diffMode ? 'Switch to Editor' : 'Show Diff'}
                </Button>
              </div>
            </div>
          )}

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
