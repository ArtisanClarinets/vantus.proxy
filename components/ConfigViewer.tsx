'use client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

export function ConfigViewer({ code }: { code: string }) {
  return (
    <div className="rounded-lg overflow-hidden border border-gray-700">
        <SyntaxHighlighter
            language="nginx"
            style={vscDarkPlus}
            showLineNumbers
            customStyle={{ margin: 0, padding: '1.5rem', background: '#0d1117' }}
        >
        {code}
        </SyntaxHighlighter>
    </div>
  );
}
