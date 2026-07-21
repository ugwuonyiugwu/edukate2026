'use client';

import katex from "katex";
import "katex/dist/katex.min.css";

interface MathTextProps {
  text: string;
  className?: string;
}

export function MathText({ text, className = "" }: MathTextProps) {
  if (!text) return null;

  // 💡 MIXED NUMBER CONVERSION LOGIC
  // 1. Catches "$3 1/2$" or "$$3 1/2$$" where a space separates the whole number and the fraction digits
  let processedText = text.replace(/(\$\$|\$)(.*?)\b(\d+)\s+(\d+)\/(\d+)\b(.*?)\1/g, (match, delimiter, before, whole, num, den, after) => {
    return `${delimiter}${before}${whole}\\ \\frac{${num}}{${den}}${after}${delimiter}`;
  });

  // 2. Extra safety fallback: If you completely forget the '$' signs and type plain text "3 1/2", 
  // this converts it into an inline math block automatically so it still renders beautifully.
  processedText = processedText.replace(/(?<!\$)\b(\d+)\s+(\d+)\/(\d+)\b(?!\$)/g, (_, whole, num, den) => {
    return `$${whole}\\ \\frac{${num}}{${den}}$`;
  });

  // Split text by block math ($$...$$) and inline math ($...$) using the processed text
  const parts = processedText.split(/(\$\$.*?\$\$|\$.*?\$)/g);

  return (
    <span className={`inline-block leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        // Handle Block Math: $$ \frac{1}{2} $$
        if (part.startsWith("$$") && part.endsWith("$$")) {
          const formula = part.slice(2, -2);
          try {
            const html = katex.renderToString(formula, {
              displayMode: true,
              throwOnError: false,
            });
            return (
              <div 
                key={index} 
                className="my-4 overflow-x-auto overflow-y-hidden py-1 clear-both"
                dangerouslySetInnerHTML={{ __html: html }} 
              />
            );
          } catch (error) {
            console.error("KaTeX Block Error:", error);
            return <code key={index} className="text-red-500">{part}</code>;
          }
        }

        // Handle Inline Math: $ \frac{1}{2} $
        if (part.startsWith("$") && part.endsWith("$")) {
          const formula = part.slice(1, -1);
          try {
            const html = katex.renderToString(formula, {
              displayMode: false,
              throwOnError: false,
            });
            return (
              <span 
                key={index} 
                className="inline-block mx-1 align-middle"
                dangerouslySetInnerHTML={{ __html: html }} 
              />
            );
          } catch (error) {
            console.error("KaTeX Inline Error:", error);
            return <code key={index} className="text-red-500">{part}</code>;
          }
        }

        // Handle Regular Text
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}