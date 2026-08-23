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
import { useLiveCollaborators } from '@/hooks/useLiveCollaborators';

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
  const { data: liveCollaborators } = useLiveCollaborators(
    collaborators,
    interactive,
  );

  if (!collaborators || collaborators.length === 0) {
    return null;
  }

  // Create a lookup for quick access to live data
  const liveDataMap = new Map(liveCollaborators?.map((c) => [c.id, c]) || []);

  return (
    <div className={cn('mt-3 flex flex-wrap gap-2', className)}>
      {collaborators.map((collaborator) => {
        const liveData = liveDataMap.get(collaborator.id);
        const name = liveData?.name || collaborator.name;
        const image = liveData?.image || collaborator.image;
        const username = liveData?.username || collaborator.username;

        const avatar = (
          <Avatar className={cn(SIZE_CLASSES[size], 'ring-2', ringClassName)}>
            <AvatarImage src={image || undefined} alt={name} />
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
                <Link href={getProfileUrl(username)}>{avatar}</Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>{name}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      })}
    </div>
  );
}
