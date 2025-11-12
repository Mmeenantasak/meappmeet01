
import React, { useState, useRef, useMemo, useEffect, forwardRef } from 'react';

interface TranscriptPanelProps {
  transcript: string;
  setTranscript: (transcript: string) => void;
}

const TranscriptPanel = forwardRef<HTMLTextAreaElement, TranscriptPanelProps>(
  ({ transcript, setTranscript }, ref) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [matches, setMatches] = useState<RegExpMatchArray[]>([]);
    const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
    
    const highlightOverlayRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (highlightOverlayRef.current) {
        highlightOverlayRef.current.scrollTop = e.currentTarget.scrollTop;
        highlightOverlayRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
    };

    const highlightedContent = useMemo(() => {
      if (!searchQuery) return transcript;
      const regex = new RegExp(`(${searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      return transcript.replace(regex, '<mark class="bg-yellow-400/50 dark:bg-yellow-600/50">$1</mark>');
    }, [transcript, searchQuery]);

    useEffect(() => {
      if (searchQuery) {
        const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        const allMatches = Array.from(transcript.matchAll(regex));
        setMatches(allMatches);
        setCurrentMatchIndex(allMatches.length > 0 ? 0 : -1);
      } else {
        setMatches([]);
        setCurrentMatchIndex(-1);
      }
    }, [searchQuery, transcript]);

    const navigateMatches = (direction: 'next' | 'prev') => {
        if (matches.length === 0) return;
        
        let nextIndex;
        if (direction === 'next') {
            nextIndex = (currentMatchIndex + 1) % matches.length;
        } else {
            nextIndex = (currentMatchIndex - 1 + matches.length) % matches.length;
        }
        setCurrentMatchIndex(nextIndex);

        const textarea = (ref as React.RefObject<HTMLTextAreaElement>).current;
        if (textarea && matches[nextIndex]) {
            const match = matches[nextIndex];
            if (match.index !== undefined) {
                textarea.focus();
                textarea.setSelectionRange(match.index, match.index + match[0].length);
                
                const lineHeight = parseFloat(getComputedStyle(textarea).lineHeight);
                const lines = transcript.substring(0, match.index).split('\n').length;
                textarea.scrollTop = (lines - 5) * lineHeight;
            }
        }
    };

    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-800">
        <div className="p-2 border-b border-gray-200 dark:border-gray-700 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-grow p-1 px-2 rounded bg-gray-100 dark:bg-gray-700 border border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex items-center space-x-1">
            <button onClick={() => navigateMatches('prev')} disabled={matches.length === 0} className="p-1 disabled:opacity-50">▲</button>
            <button onClick={() => navigateMatches('next')} disabled={matches.length === 0} className="p-1 disabled:opacity-50">▼</button>
            {matches.length > 0 && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {currentMatchIndex + 1} / {matches.length}
                </span>
            )}
          </div>
        </div>
        <div className="relative flex-grow">
          <textarea
            ref={ref}
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            onScroll={handleScroll}
            className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-gray-800 dark:caret-gray-200 resize-none font-mono text-base leading-relaxed focus:outline-none z-10"
            spellCheck="false"
          />
          <div
            ref={highlightOverlayRef}
            className="absolute inset-0 w-full h-full p-4 overflow-auto pointer-events-none font-mono text-base leading-relaxed whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: highlightedContent + '\n' }} // Add newline to sync scroll height
          />
        </div>
      </div>
    );
  }
);

export default TranscriptPanel;
