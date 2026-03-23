import { Angry, Frown, Meh, Smile, SmilePlus } from 'lucide-react';

export const MoodIcon = ({ mood, className, size }: { mood: number, className?: string, size?: number }) => {
  switch (mood) {
    case 1: return <Angry className={className} size={size} />;
    case 2: return <Frown className={className} size={size} />;
    case 3: return <Meh className={className} size={size} />;
    case 4: return <Smile className={className} size={size} />;
    case 5: return <SmilePlus className={className} size={size} />;
    default: return <Meh className={className} size={size} />;
  }
};
