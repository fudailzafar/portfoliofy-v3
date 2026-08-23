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
  onBack?: () => void;
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
  onBack,
}: ListTabLayoutProps) {
  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <TabHeader
        title={title}
        showAddButton={view === 'list'}
        onAdd={onAdd}
        addButtonText={addButtonText}
        showBackButton={view === 'form'}
        onBack={onBack}
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
        <div className="w-full min-w-0 space-y-6">{renderForm()}</div>
      )}
    </div>
  );
}
