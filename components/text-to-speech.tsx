'use client'

import * as React from 'react'
import { Volume2 } from 'lucide-react'

export function TextToSpeech() {
  const [selection, setSelection] = React.useState<{ text: string; x: number; y: number } | null>(null);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleMouseUp = () => {
      const currentSelection = window.getSelection();
      const selectedText = currentSelection?.toString().trim();

      if (selectedText) {
        const range = currentSelection!.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelection({
          text: selectedText,
          x: rect.left + window.scrollX + rect.width / 2,
          y: rect.top + window.scrollY - 10, // Position above the selection
        });
      }
    };
    
    const handleMouseDown = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
            setSelection(null);
        }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleSpeak = (event: React.MouseEvent) => {
    event.preventDefault();
    if ('speechSynthesis' in window && selection?.text) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(selection.text);
      window.speechSynthesis.speak(utterance);
    }
    setSelection(null);
  };

  if (!selection) {
    return null;
  }

  return (
    <div
      ref={popoverRef}
      style={{
        position: 'absolute',
        top: selection.y,
        left: selection.x,
        transform: 'translate(-50%, -100%)',
        zIndex: 1000,
      }}
      className='bg-black text-white rounded-lg p-2 shadow-lg flex items-center'
    >
      <button onClick={handleSpeak} className='flex items-center gap-2'>
        <Volume2 className='h-5 w-5' />
        <span>Speak</span>
      </button>
    </div>
  );
}
