'use client';

import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarPlaceholderIcon } from '@/components/composite/AvatarPlaceholderIcon';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { CollaboratorSchemaType } from '@/lib/resume';
import { useProfileUrl } from '@/lib/ProfileUrlContext';

interface AvatarStackProps {
  collaborators?: CollaboratorSchemaType[];
  size?: 'sm' | 'md';
  interactive?: boolean;
  ringClassName?: string;
  className?: string;
}

const SIZE_CLASSES = {
  sm: 'size-6',
  md: 'size-9',
};

export function AvatarStack({
  collaborators,
  size = 'md',
  interactive = false,
  ringClassName = 'ring-theme-bg',
  className,
}: AvatarStackProps) {
  const getProfileUrl = useProfileUrl();

  if (!collaborators || collaborators.length === 0) {
    return null;
  }

  return (
    <div className={cn('mt-3 flex flex-wrap gap-2', className)}>
      {collaborators.map((collaborator) => {
        const avatar = (
          <Avatar className={cn(SIZE_CLASSES[size], 'ring-2', ringClassName)}>
            <AvatarImage
              src={collaborator.image || undefined}
              alt={collaborator.name}
            />
            <AvatarFallback className="bg-theme-bg">
              <AvatarPlaceholderIcon className="text-theme-border" />
            </AvatarFallback>
          </Avatar>
        );

        if (!interactive) {
          return <div key={collaborator.id}>{avatar}</div>;
        }

        return (
          <TooltipProvider key={collaborator.id}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href={getProfileUrl(collaborator.username)}>
                  {avatar}
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{collaborator.name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
