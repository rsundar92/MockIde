'use client'

import React, { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { ChevronDown, ChevronRight, File, Folder, GitBranch } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { 
  ssr: false,
  loading: () => <p>Loading editor...</p>
})

// Mock file system
const initialFileSystem = {
  'src': {
    'pages': {
      'api': {
        'hello.ts': 'export default function handler(req, res) {\n  res.status(200).json({ name: "John Doe" })\n}',
      },
      'index.tsx': 'export default function Home() {\n  return <h1>Welcome to Next.js!</h1>\n}',
      '_app.tsx': 'import "../styles/globals.css"\n\nexport default function App({ Component, pageProps }) {\n  return <Component {...pageProps} />\n}',
    },
    'styles': {
      'globals.css': 'body {\n  font-family: sans-serif;\n}',
    },
  },
  'public': {
    'favicon.ico': '[Binary content]',
  },
  'package.json': '{\n  "name": "my-nextjs-app",\n  "version": "0.1.0",\n  "private": true\n}',
}

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

  const renderTree = useCallback((obj: any, path: string = '') => {
    return Object.entries(obj).map(([key, value]) => {
      const currentPath = `${path}${key}`
      if (typeof value === 'object') {
        return (
          <div key={currentPath}>
            <div
              className="flex items-center cursor-pointer hover:bg-gray-100 py-1"
              onClick={() => toggleFolder(currentPath)}
            >
              {expandedFolders.includes(currentPath) ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              <Folder className="w-4 h-4 mr-2" />
              {key}
            </div>
            {expandedFolders.includes(currentPath) && (
              <div className="ml-4">Render tree 2{renderTree(value, `${currentPath}/`)}</div>
            )}
          </div>
        )
      } else {
        return (
          <div
            key={currentPath}
            className={`flex items-center cursor-pointer hover:bg-gray-100 py-1 ${
              selectedFile === currentPath ? 'bg-blue-100' : ''
            }`}
            onClick={() => selectFile(currentPath, value as string)}
          >
            <File className="w-4 h-4 mr-2" />
            {key}
          </div>
        )
      }
    })
  }, [expandedFolders, selectedFile, toggleFolder, selectFile])

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
          <div className="p-4">Render tree {renderTree(fileSystem)}</div>
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