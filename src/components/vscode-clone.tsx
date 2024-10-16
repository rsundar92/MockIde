'use client'

import React, { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown, ChevronRight, File, Folder, GitBranch } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { initialFileSystem } from './initialFileSystem'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
})

const branches = ['main', 'develop', 'feature/new-ui']

export function VscodeClone() {
  const [fileSystem, setFileSystem] = useState(initialFileSystem)
  const [selectedFile, setSelectedFile] = useState('')
  const [fileContent, setFileContent] = useState('')
  const [expandedFolders, setExpandedFolders] = useState<string[]>([])
  const [currentBranch, setCurrentBranch] = useState('main')
  const [localPath, setLocalPath] = useState('/path/to/your/project')

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders(prev =>
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    )
  }, [])

  const selectFile = useCallback((path: string, content: string) => {
    setSelectedFile(path)
    setFileContent(content)
  }, [])

  const updateFileSystem = useCallback((path: string, content: string) => {
    setFileSystem(prevFileSystem => {
      const newFileSystem = { ...prevFileSystem }
      const pathParts = path.split('/')
      let current = newFileSystem
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]]
      }
      current[pathParts[pathParts.length - 1]] = content
      return newFileSystem
    })
  }, [])

  

  // const renderTree = useCallback((files: any[], depth = 0) => {
  //   const currentLevelFiles = files.filter(file => file.depth === depth)
  
  //   return currentLevelFiles.map(file => {
  //     const hasChildren = files.some(f => f.relativePath.startsWith(`${file.relativePath}/`) && f.depth === depth + 1)
  
  //     if (file.pathType === 'directory') {
  //       return (
  //         <div key={file.relativePath}>
  //           <div
  //             className="flex items-center cursor-pointer hover:bg-gray-100 py-1"
  //             onClick={() => toggleFolder(file.relativePath)}
  //           >
  //             {expandedFolders.includes(file.relativePath) ? (
  //               <ChevronDown className="w-4 h-4 mr-1" />
  //             ) : (
  //               <ChevronRight className="w-4 h-4 mr-1" />
  //             )}
  //             <Folder className="w-4 h-4 mr-2" />
  //             {file.name}
  //           </div>
  //           {expandedFolders.includes(file.relativePath) && hasChildren && (
  //             <div className="ml-4">{renderTree(files, depth + 1)}</div>
  //           )}
  //         </div>
  //       )
  //     } else if (file.pathType === 'file') {
  //       return (
  //         <div
  //           key={file.relativePath}
  //           className={`flex items-center cursor-pointer hover:bg-gray-100 py-1 ${
  //             selectedFile === file.relativePath ? 'bg-blue-100' : ''
  //           }`}
  //           onClick={() => selectFile(file.relativePath, file.content || '')}
  //         >
  //           <File className="w-4 h-4 mr-2" />
  //           {file.name}
  //         </div>
  //       )
  //     }
  
  //     return null
  //   })
  // }, [expandedFolders, selectedFile, toggleFolder, selectFile])

  const renderTree = useCallback((files: any[], depth = 0, parentPath = '') => {
    const currentLevelFiles = files.filter(file => {
      const isDirectChild = file.relativePath.startsWith(parentPath) &&
        file.depth === depth && 
        !file.relativePath.slice(parentPath.length + 1).includes('/'); // Ensure no deeper subdirectory
      return isDirectChild;
    });
  
    return currentLevelFiles.map(file => {
      const hasChildren = files.some(f => 
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
              <div className="ml-4">{renderTree(files, depth + 1, file.relativePath)}</div>
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
            onClick={() => selectFile(file.relativePath, file.content || '')}
          >
            <File className="w-4 h-4 mr-2" />
            {file.name}
          </div>
        );
      }
  
      return null;
    });
  }, [expandedFolders, selectedFile, toggleFolder, selectFile]);
  

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (value !== undefined && selectedFile) {
      setFileContent(value)
      updateFileSystem(selectedFile, value)
    }
  }, [selectedFile, updateFileSystem])

  const getLanguage = useCallback((fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return 'typescript'
      case 'css':
        return 'css'
      case 'json':
        return 'json'
      default:
        return 'plaintext'
    }
  }, [])

  useEffect(() => {
    // Mock loading files from local path
    console.log(`Loading files from: ${localPath}`)
    // In a real implementation, you would load files from the local path here
  }, [localPath])

  return (
    <div className="flex flex-col h-screen bg-white">
      <div className="p-4 border-b border-gray-200">
        <Input
          type="text"
          value={localPath}
          onChange={(e) => setLocalPath(e.target.value)}
          placeholder="Enter local path"
          className="mb-2"
        />
        <Select value={currentBranch} onValueChange={setCurrentBranch}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {branches.map(branch => (
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
              language={getLanguage(selectedFile)}
              theme="vs-dark"
              value={fileContent}
              options={{
                minimap: { enabled: false },
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
  )
}