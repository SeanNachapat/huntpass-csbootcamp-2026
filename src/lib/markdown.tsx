import React from 'react';

interface MarkdownTextProps {
  text: string | null | undefined;
}

export default function MarkdownText({ text }: MarkdownTextProps) {
  if (!text) return null;

  // Split text by lines
  const lines = text.split('\n');
  const result: React.ReactNode[] = [];
  
  let inList = false;
  let listItems: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check for bullet list item: starts with *, -, or + followed by whitespace
    const listMatch = line.match(/^[\*\-\+]\s+(.*)/);
    if (listMatch) {
      inList = true;
      listItems.push(
        <li key={`li-${i}`} className="list-disc ml-5 mb-1.5 text-left font-sarabun text-sm leading-relaxed text-[#4e3c2b]">
          {renderInlineMarkdown(listMatch[1])}
        </li>
      );
      continue;
    } else {
      // If we were in a list, flush it out
      if (inList) {
        result.push(
          <ul key={`ul-${i}`} className="space-y-1 my-3 text-left">
            {...listItems}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    }
    
    // Check for empty line
    if (line.trim() === '') {
      result.push(<div key={`br-${i}`} className="h-2" />);
      continue;
    }
    
    // Check for headers: #, ##, ###, etc.
    const headerMatch = line.match(/^(#{1,6})\s+(.*)/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const content = renderInlineMarkdown(headerMatch[2]);
      const headerClass = 
        level === 1 ? "text-xl font-bold font-playfair my-3 text-left border-b border-[#e1d5ba]/60 pb-1 text-[#2c1d11]" :
        level === 2 ? "text-lg font-bold font-playfair my-2.5 text-left text-[#2c1d11]" :
        "text-base font-bold font-playfair my-2 text-left text-[#2c1d11]";
      
      result.push(React.createElement(`h${Math.min(level, 6)}`, { key: `h-${i}`, className: headerClass }, content));
      continue;
    }
    
    // Normal paragraph line
    result.push(
      <p key={`p-${i}`} className="font-sarabun text-sm text-left leading-relaxed mb-2 text-[#4e3c2b]">
        {renderInlineMarkdown(line)}
      </p>
    );
  }
  
  // Flush any trailing list items
  if (inList) {
    result.push(
      <ul key="ul-end" className="space-y-1 my-3 text-left">
        {...listItems}
      </ul>
    );
  }
  
  return <div className="markdown-body">{result}</div>;
}

function renderInlineMarkdown(text: string): React.ReactNode {
  // Simple regex tokenizer for bold (**), italics (*), links [label](url), and inline code (`)
  const tokenRegex = /(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\)|`.*?`)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    // Bold: **text**
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-bold text-[#2c1d11]">
          {part.slice(2, -2)}
        </strong>
      );
    }
    // Italics: *text*
    if (part.startsWith('*') && part.endsWith('*')) {
      return (
        <em key={index} className="italic text-[#4e3c2b]">
          {part.slice(1, -1)}
        </em>
      );
    }
    // Inline code: `code`
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="font-mono bg-[#4e3c2b]/10 px-1 py-0.5 rounded text-xs text-rose-800 font-semibold">
          {part.slice(1, -1)}
        </code>
      );
    }
    // Link: [label](url)
    const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
    if (linkMatch) {
      return (
        <a 
          key={index} 
          href={linkMatch[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-amber-800 font-bold hover:underline"
        >
          {linkMatch[1]}
        </a>
      );
    }
    // Plain text
    return part;
  });
}
