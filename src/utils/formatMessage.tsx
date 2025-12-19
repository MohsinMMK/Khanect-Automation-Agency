import React from 'react';

/**
 * Formats chatbot messages with professional styling
 * Supports: line breaks, bold text, bullet points, numbered lists, links, code blocks
 */
export const formatMessage = (text: string): React.ReactNode => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let codeBlockContent: string[] = [];
  let inCodeBlock = false;

  lines.forEach((line, index) => {
    // Handle code blocks (```)
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        elements.push(
          <pre key={`code-${index}`} className="bg-gray-100 dark:bg-gray-900 rounded-lg p-3 my-2 overflow-x-auto">
            <code className="text-sm text-gray-800 dark:text-gray-200 font-mono">
              {codeBlockContent.join('\n')}
            </code>
          </pre>
        );
        codeBlockContent = [];
        inCodeBlock = false;
      } else {
        // Start code block
        inCodeBlock = true;
      }
      return;
    }

    if (inCodeBlock) {
      codeBlockContent.push(line);
      return;
    }

    // Skip empty lines but preserve spacing
    if (line.trim() === '') {
      elements.push(<div key={`space-${index}`} className="h-2" />);
      return;
    }

    // Format the line content
    let formattedLine: React.ReactNode = line;

    // Convert **bold** to <strong>
    formattedLine = formatBold(formattedLine as string);

    // Convert *italic* to <em>
    formattedLine = formatItalic(formattedLine as string);

    // Convert URLs to links
    formattedLine = formatLinks(formattedLine as string);

    // Handle bullet points
    if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
      const content = line.trim().substring(2);
      elements.push(
        <div key={`bullet-${index}`} className="flex gap-2 my-1">
          <span className="text-brand-lime mt-1">•</span>
          <span>{formatInlineContent(content)}</span>
        </div>
      );
      return;
    }

    // Handle numbered lists
    const numberedMatch = line.trim().match(/^(\d+)\.\s+(.+)$/);
    if (numberedMatch) {
      const [, number, content] = numberedMatch;
      elements.push(
        <div key={`numbered-${index}`} className="flex gap-2 my-1">
          <span className="text-brand-lime font-medium min-w-[1.5rem]">{number}.</span>
          <span>{formatInlineContent(content)}</span>
        </div>
      );
      return;
    }

    // Handle headers (##)
    if (line.trim().startsWith('## ')) {
      const headerText = line.trim().substring(3);
      elements.push(
        <h3 key={`header-${index}`} className="font-bold text-base mt-3 mb-1">
          {formatInlineContent(headerText)}
        </h3>
      );
      return;
    }

    // Handle headers (#)
    if (line.trim().startsWith('# ')) {
      const headerText = line.trim().substring(2);
      elements.push(
        <h2 key={`header-${index}`} className="font-bold text-lg mt-3 mb-1">
          {formatInlineContent(headerText)}
        </h2>
      );
      return;
    }

    // Regular paragraph
    elements.push(
      <p key={`line-${index}`} className="my-1">
        {formatInlineContent(formattedLine as string)}
      </p>
    );
  });

  return <div className="space-y-0">{elements}</div>;
};

/**
 * Format inline content (bold, italic, links, inline code)
 */
const formatInlineContent = (text: string): React.ReactNode => {
  // Handle inline code first (`code`)
  const parts = text.split(/(`[^`]+`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code key={i} className="bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
          {code}
        </code>
      );
    }

    // Format bold **text**
    let formatted: React.ReactNode = part;
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
    formatted = boldParts.map((boldPart, j) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        return <strong key={`${i}-${j}`} className="font-semibold">{boldPart.slice(2, -2)}</strong>;
      }

      // Format italic *text*
      const italicParts = boldPart.split(/(\*[^*]+\*)/g);
      return italicParts.map((italicPart, k) => {
        if (italicPart.startsWith('*') && italicPart.endsWith('*') && !italicPart.startsWith('**')) {
          return <em key={`${i}-${j}-${k}`} className="italic">{italicPart.slice(1, -1)}</em>;
        }

        // Format URLs
        return formatLinksInText(italicPart, `${i}-${j}-${k}`);
      });
    });

    return formatted;
  });
};

/**
 * Convert URLs to clickable links
 */
const formatLinksInText = (text: string, key: string): React.ReactNode => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a
          key={`${key}-link-${i}`}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-lime hover:underline"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

const formatBold = (text: string): string => text;
const formatItalic = (text: string): string => text;
const formatLinks = (text: string): string => text;
