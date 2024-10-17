'use client';

import React, { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  ChevronDown,
  ChevronRight,
  File,
  Folder,
  GitBranch,
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Worksheets } from './openWorksheets';
import axios from 'axios';
import { FileSystemItem } from '@/types/type';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const branches = ['main', 'develop', 'feature/new-ui'];

export function MockIDE() {
  const [fileSystem, setFileSystem] = useState<{ files: FileSystemItem[] }>({ files: [] });
  const [openWorksheets, setOpenWorkSheets] = useState(
    Worksheets.activeWorksheets
  );
  const [selectedFile, setSelectedFile] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<string[]>([]);
  const [currentBranch, setCurrentBranch] = useState('main');
  const [isLoadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoadingFiles(true);
      try {
        const response = await axios.get('/list-files.json');
        setTimeout(() => {
          setFileSystem(response?.data?.data);
        }, 500)
      } catch (error) {
        setError(error);
      } finally {
        setLoadingFiles(false);
      }
    };

    fetchData();
  }, []);

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) =>
      prev.includes(path) ? prev.filter((p) => p !== path) : [...prev, path]
    );
  }, []);

  const selectFile = useCallback((path: string, content: string) => {
    const worksheet = openWorksheets.find(
      (worksheet) => worksheet.relativePath === path
    );
    setSelectedFile(path);
    setFileContent(
      worksheet?.content ||
        worksheet?.editorContent ||
        worksheet?.modifiedContent ||
        content
    );
  }, []);

  const updateFileSystem = useCallback((path: string, content: string) => {
    setFileSystem((prevFileSystem) => {
      const newFileSystem = { ...prevFileSystem };
      const pathParts = path.split('/');
      let current = newFileSystem;
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      current[pathParts[pathParts.length - 1]] = content;
      return newFileSystem;
    });
  }, []);

  const renderTree = useCallback(
    (files: FileSystemItem[], depth = 0, parentPath = '') => {
      if (!files) return;
      const currentLevelFiles = files.filter((file: FileSystemItem) => {
        const isDirectChild =
          file.relativePath.startsWith(parentPath) &&
          file.depth === depth &&
          !file.relativePath.slice(parentPath.length + 1).includes('/'); // Ensure no deeper subdirectory
        return isDirectChild;
      });

      return currentLevelFiles.map((file: FileSystemItem) => {
        const hasChildren = files?.some(
          (f: FileSystemItem) =>
            f.relativePath.startsWith(`${file.relativePath}/`) &&
            f.depth === depth + 1
        );

        if (file.pathType === 'directory') {
          return (
            <div key={file.relativePath}>
              <div
                className="flex items-center cursor-pointer hover:bg-gray-100 py-1"
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
              className={`flex items-center cursor-pointer hover:bg-gray-100 py-1 ${
                selectedFile === file.relativePath ? 'bg-blue-100' : ''
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

  const handleEditorChange = useCallback(
    (value: string | undefined) => {
      if (value !== undefined && selectedFile) {
        setFileContent(value);
        updateFileSystem(selectedFile, value);
      }
    },
    [selectedFile, updateFileSystem]
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="p-4 border-b border-gray-200">
        <Select value={currentBranch} onValueChange={setCurrentBranch}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {branches.map((branch) => (
              <SelectItem key={branch} value={branch}>
                <div className="flex items-center">
                  <GitBranch className="w-4 h-4 mr-2" />
                  {branch}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r border-gray-200 overflow-auto">
          <div className="p-4">{renderTree(fileSystem.files)}</div>
        </div>
        <div className="flex-1">
          {selectedFile ? (
            <MonacoEditor
              height="100%"
              theme="vs-dark"
              value={fileContent}
              options={{
                minimap: { enabled: true },
                scrollBeyondLastLine: false,
                fontSize: 14,
                automaticLayout: true,
              }}
              onChange={handleEditorChange}
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
