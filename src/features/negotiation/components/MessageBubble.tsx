import React from 'react';

export interface MessageBubbleProps {
  text: string;
  isMe: boolean;
  timeString: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ text, isMe, timeString }) => {
  return (
    <div
      className={`p-3 rounded-card max-w-[82%] flex flex-col gap-1 shadow-sm ${
        isMe
          ? 'bg-secondary text-white rounded-tr-none ml-auto'
          : 'bg-white text-on-surface rounded-tl-none mr-auto border border-border-subtle'
      }`}
    >
      <p className="text-body-md whitespace-pre-wrap leading-relaxed">{text}</p>
      <div className={`text-[10px] text-right ${isMe ? 'text-white/70' : 'text-text-secondary'}`}>
        {timeString}
      </div>
    </div>
  );
};
