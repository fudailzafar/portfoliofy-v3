'use client';

import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CollaboratorSchemaType } from '@/lib/resume';
import { useCollaboratorSearch } from '@/hooks/useCollaboratorSearch';

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('');
}

interface CollaboratorsFieldProps {
  label: string;
  value: CollaboratorSchemaType[];
  onChange: (value: CollaboratorSchemaType[]) => void;
}

export function CollaboratorsField({
  label,
  value,
  onChange,
}: CollaboratorsFieldProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data: results, isFetching } = useCollaboratorSearch(query);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const taggedIds = new Set(value.map((c) => c.id));
  const filteredResults = (results || []).filter((r) => !taggedIds.has(r.id));

  const handleSelect = (collaborator: CollaboratorSchemaType) => {
    onChange([...value, collaborator]);
    setQuery('');
    setIsOpen(false);
  };

  const handleRemove = (id: string) => {
    onChange(value.filter((c) => c.id !== id));
  };

  return (
    <div className="w-full min-w-0 space-y-2">
      <Label className="text-xs text-content-secondary">{label}</Label>

      <div ref={containerRef} className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={`Search ${label.toLowerCase()}`}
        />

        {isOpen && query.trim().length > 0 && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-border-strong bg-surface-card shadow-md">
            {isFetching && (
              <div className="px-3 py-2.5 text-sm text-content-muted">
                Searching…
              </div>
            )}
            {!isFetching && filteredResults.length === 0 && (
              <div className="px-3 py-2.5 text-sm text-content-muted">
                No one found
              </div>
            )}
            {!isFetching &&
              filteredResults.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => handleSelect(result)}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left hover:bg-surface-2"
                >
                  <Avatar className="size-7 shrink-0">
                    <AvatarImage
                      src={result.image || undefined}
                      alt={result.name}
                    />
                    <AvatarFallback className="text-xs">
                      {initials(result.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-content-primary">
                      {result.name}
                    </p>
                    <p className="truncate text-xs text-content-muted">
                      @{result.username}
                    </p>
                  </div>
                </button>
              ))}
          </div>
        )}
      </div>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-1">
          {value.map((collaborator) => (
            <div
              key={collaborator.id}
              className="bg-surface-2/50 flex items-center gap-1.5 rounded-full border border-border-strong py-1 pl-1 pr-2"
            >
              <Avatar className="size-5 shrink-0">
                <AvatarImage
                  src={collaborator.image || undefined}
                  alt={collaborator.name}
                />
                <AvatarFallback className="text-[10px]">
                  {initials(collaborator.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-content-primary">
                {collaborator.name}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(collaborator.id)}
                className="text-content-muted hover:text-content-primary"
                aria-label={`Remove ${collaborator.name}`}
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
