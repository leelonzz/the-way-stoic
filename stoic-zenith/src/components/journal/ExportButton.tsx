import React, { useState } from 'react';
import { Download, Image, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { JournalEntry } from './types';
import html2canvas from 'html2canvas';

interface ExportButtonProps {
  entry: JournalEntry;
  className?: string;
}

export function ExportButton({ entry, className = '' }: ExportButtonProps): JSX.Element {
  const [isExporting, setIsExporting] = useState(false);

  const exportAsImage = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('[data-export-area]') as HTMLElement;
      if (!element) {
        console.error('Export area not found');
        return;
      }

      const canvas = await html2canvas(element, {
        backgroundColor: '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });

      const link = document.createElement('a');
      link.download = `journal-${entry.date}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error exporting as image:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsMarkdown = () => {
    const markdownContent = entry.blocks
      .map(block => {
        switch (block.type) {
          case 'heading': {
            const hashes = '#'.repeat(block.level || 1);
            return `${hashes} ${block.text}`;
          }
          case 'bullet-list':
            return `- ${block.text}`;
          case 'numbered-list':
            return `1. ${block.text}`;
          case 'image':
            return block.imageUrl ? `![${block.imageAlt || 'Image'}](${block.imageUrl})` : '';
          default:
            return block.text;
        }
      })
      .filter(Boolean)
      .join('\n\n');

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const link = document.createElement('a');
    link.download = `journal-${entry.date}.md`;
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={exportAsImage}
        disabled={isExporting}
        size="sm"
        variant="outline"
        className="border-stone-300 hover:border-orange-400 hover:text-orange-600"
      >
        <Image className="w-4 h-4 mr-1" />
        {isExporting ? 'Exporting...' : 'PNG'}
      </Button>
      
      <Button
        onClick={exportAsMarkdown}
        size="sm"
        variant="outline"
        className="border-stone-300 hover:border-orange-400 hover:text-orange-600"
      >
        <FileText className="w-4 h-4 mr-1" />
        MD
      </Button>
    </div>
  );
}