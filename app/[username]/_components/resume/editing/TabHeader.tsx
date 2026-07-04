interface TabHeaderProps {
  title: string;
  showAddButton: boolean;
  onAdd: () => void;
  addButtonText?: string;
}

export function TabHeader({
  title,
  showAddButton,
  onAdd,
  addButtonText = 'Add item',
}: TabHeaderProps) {
  return (
    <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
      <h2 className="text-xl sm:text-2xl font-bold text-content-primary">{title}</h2>
      {showAddButton && (
        <button
          onClick={onAdd}
          className="inline-flex h-8 items-center justify-center rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-colors active:bg-surface-3"
        >
          {addButtonText}
        </button>
      )}
    </div>
  );
}
