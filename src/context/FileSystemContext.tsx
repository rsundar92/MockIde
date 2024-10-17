'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import type { FileSystemItem } from '@/types/type';

type FileSystemContextType = {
  fileSystem: { files: FileSystemItem[] };
  isLoadingFiles: boolean;
  error: Error;
  fetchFileSystem: () => void;
  updateFileSystem: (path: string, content: string) => void;
};

const FileSystemContext = createContext<FileSystemContextType | undefined>(
  undefined
);

export const FileSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [fileSystem, setFileSystem] = useState<{ files: FileSystemItem[] }>({
    files: [],
  });
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
    // setFileSystem((prevFileSystem) => {
    //   const newFileSystem = { ...prevFileSystem };
    //   const pathParts = path.split('/');

    //   console.log('newFileSystem', newFileSystem);
    //   console.log('pathParts', pathParts);


    //   let current = newFileSystem;
    //   for (let i = 0; i < pathParts.length - 1; i++) {
    //     // Check if current has the next part of the path
    //     if (current[pathParts[i]] === undefined) {
    //       console.error(`Path not found: ${pathParts[i]}`); // Log the missing path for debugging
    //       return newFileSystem; // Return the original file system if a path is missing
    //     }
    //     current = current[pathParts[i]];
    //   }

    //   // Ensure the last part of the path exists before setting content
    //   const lastPart = pathParts[pathParts.length - 1];
    //   current[lastPart] = content; // Set the content
    //   return newFileSystem;
    // });
  };

  useEffect(() => {
    fetchFileSystem();
  }, []);

  return (
    <FileSystemContext.Provider
      value={{
        fileSystem,
        isLoadingFiles,
        error,
        fetchFileSystem,
        updateFileSystem,
      }}
    >
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
