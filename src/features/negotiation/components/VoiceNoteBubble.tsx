import React, { useState } from 'react';
import { Play, Pause, Volume2 } from 'lucide-react';

export interface VoiceNoteBubbleProps {
  isMe: boolean;
  timeString: string;
}

export const VoiceNoteBubble: React.FC<VoiceNoteBubbleProps> = ({ isMe, timeString }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div
      className={`p-3 rounded-card max-w-[85%] flex flex-col gap-1.5 shadow-sm ${
        isMe
          ? 'bg-secondary text-white rounded-tr-none ml-auto'
          : 'bg-white text-on-surface rounded-tl-none mr-auto border border-border-subtle'
      }`}
    >
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={isPlaying ? 'Pause audio note' : 'Play audio note'}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 active:scale-95 transition-transform ${
            isMe ? 'bg-white text-secondary' : 'bg-secondary text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
        </button>

        {/* Audio Waveform visualization */}
        <div className="flex items-center gap-0.5 flex-1 h-6">
          {[40, 70, 30, 90, 60, 45, 80, 50, 65, 35, 95, 60, 40, 75, 55, 85].map((height, i) => (
            <div
              key={i}
              style={{ height: `${isPlaying ? (height + (i % 3) * 10) % 100 : height}%` }}
              className={`w-1 rounded-full transition-all duration-150 ${
                isMe ? 'bg-white/80' : 'bg-secondary/70'
              }`}
            />
          ))}
        </div>

        <span className="text-xs font-bold tabular-nums">0:14</span>
      </div>

      <div className={`text-[10px] text-right ${isMe ? 'text-white/75' : 'text-text-secondary'}`}>
        {timeString}
      </div>
    </div>
  );
};
