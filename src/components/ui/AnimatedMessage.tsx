import React from 'react';
import { useAnimatedText } from '@/hooks/useAnimatedText';
import { formatMessage } from '@/utils/formatMessage';

interface AnimatedMessageProps {
  text: string;
}

export const AnimatedMessage: React.FC<AnimatedMessageProps> = ({ text }) => {
  const animatedText = useAnimatedText(text);
  
  return <>{formatMessage(animatedText)}</>;
};
