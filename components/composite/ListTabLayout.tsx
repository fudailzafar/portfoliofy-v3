import React from 'react';
import { TabHeader } from '@/app/[username]/_components/resume/editing/TabHeader';
import { EmptyState } from '@/app/[username]/_components/resume/editing/EmptyState';
import { LucideIcon } from 'lucide-react';

interface ListTabLayoutProps {
  title: string;
  view: 'list' | 'form';
  itemsLength: number;
  onAdd: () => void;
  addButtonText: string;
  emptyState: {
    icon: LucideIcon;
    buttonText: string;
    onAdd?: () => void;
  };
  renderList: () => React.ReactNode;
  renderForm: () => React.ReactNode;
}

export function ListTabLayout({
  title,
  view,
  itemsLength,
  onAdd,
  addButtonText,
  emptyState,
  renderList,
  renderForm,
}: ListTabLayoutProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <TabHeader
        title={title}
        showAddButton={view === 'list'}
        onAdd={onAdd}
        addButtonText={addButtonText}
      />

      {view === 'list' && itemsLength === 0 && (
        <EmptyState
          icon={emptyState.icon}
          buttonText={emptyState.buttonText}
          onClick={emptyState.onAdd || onAdd}
        />
      )}

      {view === 'list' && itemsLength > 0 && (
        <div className="space-y-8">{renderList()}</div>
      )}

      {view === 'form' && (
        <div className="space-y-6 w-full min-w-0">{renderForm()}</div>
      )}
    </div>
  );
}
