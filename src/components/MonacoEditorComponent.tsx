'use client';

import { useOpenWorksheets } from '@/context/OpenWorksheets';
import { Worksheet } from '@/types/type';
import dynamic from 'next/dynamic';
import { useCallback } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

type MonacoEditorProps = {
  value: string;
  onChange: (value: string | undefined) => void;
  selectedFile: string;
  openworksheets: Worksheet[];
}

const MonacoEditorComponent: React.FC<MonacoEditorProps> = ({ value, onChange, selectedFile }) => {
  const {activeWorksheets} = useOpenWorksheets();
  const currentWorksheet = activeWorksheets.find((worksheet) => worksheet.relativePath === selectedFile);
  console.log(currentWorksheet);
  const handleEditorChange = useCallback(
    (newValue: string | undefined) => {
      onChange(newValue);
    },
    [onChange]
  );

  return (
    <MonacoEditor
      height="100%"
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
  );
};

export default MonacoEditorComponent;
