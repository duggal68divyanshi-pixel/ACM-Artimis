import React, { useState } from 'react';
import { Mic, Square } from 'lucide-react';

export interface VoiceButtonProps {
  onRecordingComplete?: (audioMockUrl: string) => void;
  label?: string;
  isCompact?: boolean;
  className?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({
  onRecordingComplete,
  label = 'Voice note',
  isCompact = false,
  className = '',
}) => {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    if (isRecording) {
      setIsRecording(false);
      // Simulate finished voice note
      onRecordingComplete?.('mock://voicenote-simulated.mp3');
    } else {
      setIsRecording(true);
      // Automatically stop after 4 seconds if not clicked again
      setTimeout(() => {
        setIsRecording((prev) => {
          if (prev) {
            onRecordingComplete?.('mock://voicenote-simulated.mp3');
            return false;
          }
          return false;
        });
      }, 4000);
    }
  };

  if (isCompact) {
    return (
      <button
        type="button"
        onClick={toggleRecording}
        aria-label={isRecording ? 'Stop recording audio' : 'Record voice note'}
        className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all ${
          isRecording
            ? 'bg-danger text-white animate-pulse shadow-md ring-4 ring-danger/20'
            : 'bg-secondary/10 text-secondary hover:bg-secondary/20 active:scale-95'
        } ${className}`}
      >
        {isRecording ? <Square className="w-5 h-5 fill-current" /> : <Mic className="w-5 h-5" />}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleRecording}
      aria-label={isRecording ? 'Stop recording audio' : 'Record voice note'}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-pill text-body-md font-semibold transition-all min-h-[48px] select-none ${
        isRecording
          ? 'bg-danger text-white animate-pulse shadow-md'
          : 'bg-secondary/10 text-secondary border border-secondary/30 hover:bg-secondary/20 active:scale-95'
      } ${className}`}
    >
      {isRecording ? (
        <>
          <Square className="w-4 h-4 fill-current shrink-0" />
          <span>Recording (0:03)...</span>
        </>
      ) : (
        <>
          <Mic className="w-4 h-4 shrink-0" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
};
