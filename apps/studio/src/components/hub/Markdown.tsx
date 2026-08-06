import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/** Renderer unico per i documenti markdown di docs/ (stile in .hub-prose). */
export function Markdown({ children }: { children: string }) {
  return (
    <div className="hub-prose">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
