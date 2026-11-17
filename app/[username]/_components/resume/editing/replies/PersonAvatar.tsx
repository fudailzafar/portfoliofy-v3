import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { displayName } from './format';

export function PersonAvatar({
  person,
  className,
}: {
  person: { name: string | null; username: string; image: string | null };
  className?: string;
}) {
  const name = displayName(person);
  return (
    <Avatar className={cn('size-10', className)}>
      {person.image && <AvatarImage src={person.image} alt="" />}
      <AvatarFallback className="bg-surface-2 text-sm text-content-secondary dark:bg-border-subtle">
        {name.charAt(0).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}
