
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, Participant, Theme } from './types';
import Header from './components/Header';
import LeftPanel from './components/LeftPanel';
import TranscriptPanel from './components/TranscriptPanel';

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  const [leftPanelWidth, setLeftPanelWidth] = useState(350);
  const [isResizing, setIsResizing] = useState(false);
  
  const [state, setState] = useState<AppState>({
    participants: [
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ],
    transcript: '## Meeting Minutes\n\n- Start of the meeting.',
    columns: 2,
  });

  const transcriptRef = useRef<HTMLTextAreaElement>(null);

  // Debounced save to localStorage
  useEffect(() => {
    const handler = setTimeout(() => {
      try {
        localStorage.setItem('meetingNotesState', JSON.stringify(state));
      } catch (error) {
        console.error("Failed to save state to localStorage", error);
      }
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [state]);

  // Load state from localStorage on initial mount
  useEffect(() => {
    try {
      const savedState = localStorage.getItem('meetingNotesState');
      if (savedState) {
        setState(JSON.parse(savedState));
      }
      const savedTheme = localStorage.getItem('theme') as Theme | null;
      if (savedTheme) {
        toggleTheme(savedTheme);
      } else {
        // Set theme based on system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        toggleTheme(prefersDark ? 'dark' : 'light');
      }
    } catch (error) {
      console.error("Failed to load state from localStorage", error);
    }
  }, []);

  const toggleTheme = (newTheme?: Theme) => {
    setTheme(prevTheme => {
      const finalTheme = newTheme || (prevTheme === 'light' ? 'dark' : 'light');
      if (finalTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      localStorage.setItem('theme', finalTheme);
      return finalTheme;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth > 250 && newWidth < window.innerWidth - 250) {
        setLeftPanelWidth(newWidth);
      }
    }
  }, [isResizing]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);
  
  const updateState = <K extends keyof AppState>(key: K, value: AppState[K]) => {
    setState(prevState => ({ ...prevState, [key]: value }));
  };

  const insertTextInTranscript = (text: string) => {
    const textarea = transcriptRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    
    const needsNewline = start > 0 && currentText.charAt(start - 1) !== '\n';
    const textToInsert = (needsNewline ? '\n' : '') + text;

    const newText = currentText.substring(0, start) + textToInsert + currentText.substring(end);
    
    updateState('transcript', newText);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + textToInsert.length;
    }, 0);
  };

  return (
    <div className={`flex flex-col h-screen font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="flex flex-grow overflow-hidden">
        <div style={{ width: `${leftPanelWidth}px` }} className="flex-shrink-0 h-full overflow-y-auto p-4 border-r border-gray-200 dark:border-gray-700">
          <LeftPanel
            participants={state.participants}
            setParticipants={(p) => updateState('participants', p)}
            columns={state.columns}
            setColumns={(c) => updateState('columns', c)}
            onParticipantClick={(name) => insertTextInTranscript(`\t${name} : `)}
            transcript={state.transcript}
            setTranscript={(t) => updateState('transcript', t)}
            onTimestampClick={(ts) => insertTextInTranscript(ts)}
          />
        </div>
        <div 
          onMouseDown={handleMouseDown}
          className="w-2 cursor-col-resize flex-shrink-0 bg-gray-200 dark:bg-gray-700 hover:bg-blue-500 transition-colors"
        />
        <div className="flex-grow h-full">
          <TranscriptPanel 
            transcript={state.transcript} 
            setTranscript={(t) => updateState('transcript', t)} 
            ref={transcriptRef} 
          />
        </div>
      </main>
    </div>
  );
};

export default App;
