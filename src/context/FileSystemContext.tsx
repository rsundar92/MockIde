'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { FileSystemItem } from '@/types/type';

type FileSystemContextType = {
  fileSystem: { files: FileSystemItem[] };
  isLoadingFiles: boolean;
  error: Error;
  fetchFileSystem: () => void;
  updateFileSystem: (path: string, content: string) => void;
}

const FileSystemContext = createContext<FileSystemContextType | undefined>(undefined);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fileSystem, setFileSystem] = useState<{ files: FileSystemItem[] }>({ files: [] });
  const [isLoadingFiles, setLoadingFiles] = useState(false);
  const [error, setError] = useState(null);

  const fetchFileSystem = async () => {
    setLoadingFiles(true);
    try {
      const response = await axios.get('/list-files.json');
      setFileSystem(response?.data?.data);
    } catch (error) {
      setError(error);
    } finally {
      setLoadingFiles(false);
    }
  };

  const updateFileSystem = (path: string, content: string) => {
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
  };

  useEffect(() => {
    fetchFileSystem();
  }, []);

  return (
    <FileSystemContext.Provider value={{ fileSystem, isLoadingFiles, error, fetchFileSystem, updateFileSystem }}>
      {children}
    </FileSystemContext.Provider>
  );
};

export const useFileSystem = () => {
  const context = useContext(FileSystemContext);
  if (!context) {
    throw new Error('useFileSystem must be used within a FileSystemProvider');
  }
  return context;
};
