'use client';

import { useOpenWorksheets } from '@/context/OpenWorksheetContext';
import { Worksheet } from '@/types/type';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

const MonacoDiffEditor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.DiffEditor),
  {
    ssr: false,
    loading: () => <p>Loading diff editor...</p>,
  }
);

type MonacoEditorProps = {
  value: string;
  onChange: (value: string | undefined) => void;
  selectedFile: string;
  openworksheets: Worksheet[];
  diffMode: boolean;
};

const MonacoEditorComponent: React.FC<MonacoEditorProps> = ({
  value,
  onChange,
  selectedFile,
  diffMode,
}) => {
  const { activeWorksheets } = useOpenWorksheets();
  const currentWorksheet = activeWorksheets.find(
    (worksheet) => worksheet.relativePath === selectedFile
  );

  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      onChange(newValue);
    },
    [onChange]
  );

  const getLanguage = (file: string) => {
    const extension = file.split('.').pop();
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'py':
        return 'python';
      case 'css':
        return 'css';
      case 'html':
        return 'html';
      case 'json':
        return 'json';
      case 'yml':
        return 'yaml';
      case 'sql':
        return 'sql';
      default:
        return 'plaintext';
    }
  };

  return (
    <>
      {diffMode ? (
        <MonacoDiffEditor
          height="100%"
          language={getLanguage(selectedFile) as unknown as string}
          theme="vs-dark"
          original={currentWorksheet?.content}
          modified={currentWorksheet?.modifiedContent}
          options={{
            renderSideBySide: true,
            renderIndicators: true,
            enableSplitViewResizing: true,
            automaticLayout: true,
            fontSize: 14,
          }}
        />
      ) : (
        <MonacoEditor
          height="100%"
          language={getLanguage(selectedFile) as unknown as string}
          theme="vs-dark"
          value={value}
          options={{
            minimap: { enabled: true },
            scrollBeyondLastLine: false,
            fontSize: 14,
            automaticLayout: true,
          }}
          onChange={handleEditorChange}
        />
      )}
    </>
  );
};

export default MonacoEditorComponent;
