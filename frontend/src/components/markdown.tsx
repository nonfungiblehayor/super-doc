import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
type MarkdownProps = {
  content: string;
}
const MarkdownRenderer = ({ content }: MarkdownProps) => {
  return (
    <div> 
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ node, ...props }) => (
            <p style={{ margin: 0, marginBottom: '0.5rem' }} {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul style={{ margin: 0, marginBottom: '0.5rem', paddingLeft: '20px' }} {...props} />
          ),
          ol: ({ node, ...props }) => (
            <ol style={{ margin: 0, marginBottom: '0.5rem', paddingLeft: '20px' }} {...props} />
          ),
          li: ({ node, ...props }) => (
            <li style={{ margin: 0, marginBottom: '0.25rem' }} {...props} />
          ),
          code({ inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match) {
              return (
                <div style={{ margin: 0, marginBottom: '0.5rem' }}>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, "")}
                  </SyntaxHighlighter>
                </div>
              );
            } else {
              // Inline code doesn't need margin
              return (
                <code style={{ background: '#282c34', color: '#abb2bf', padding: '2px 6px', borderRadius: '4px', fontSize: '0.875rem' }} {...props}>
                  {children}
                </code>
              );
            }
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
export default MarkdownRenderer;


