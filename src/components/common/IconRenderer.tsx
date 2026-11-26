import React from 'react';
import * as LucideIcons from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  size?: number;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className = 'w-5 h-5', size }) => {
  // @ts-expect-error - dynamic Lucide icon lookup
  const Component = LucideIcons[name] || LucideIcons.CircleDollarSign;
  return <Component className={className} size={size} />;
};
