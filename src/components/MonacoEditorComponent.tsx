'use client';

import dynamic from 'next/dynamic';
import { useCallback } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), {
  ssr: false,
  loading: () => <p>Loading editor...</p>,
});

interface MonacoEditorProps {
  value: string;
  onChange: (value: string | undefined) => void;
}

const MonacoEditorComponent: React.FC<MonacoEditorProps> = ({ value, onChange }) => {
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
