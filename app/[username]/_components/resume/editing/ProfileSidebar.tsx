import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';
import { SortableSidebarItem } from './SortableSidebarItem';
import { SidebarButton } from './SidebarButton';
import { useTheme } from 'next-themes';
import { Switch } from '@/components/ui/switch';
import React from 'react';

interface ProfileSidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setShowMobileMenu: (show: boolean) => void;
  showMobileMenu: boolean;
  sectionOrder: string[];
  setSectionOrder: (order: string[]) => void;
  tabDefinitions: Record<string, { label: string; disabled: boolean }>;
  onDragEnd: (event: DragEndEvent) => void;
}

export function ProfileSidebar({
  activeTab,
  setActiveTab,
  setShowMobileMenu,
  showMobileMenu,
  sectionOrder,
  tabDefinitions,
  onDragEnd,
}: ProfileSidebarProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isDark, setIsDark] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsDark(resolvedTheme === 'dark' || theme === 'dark');
  }, [resolvedTheme, theme]);

  const handleThemeToggle = (checked: boolean) => {
    setIsDark(checked);
    // Let the switch animation finish smoothly before triggering the heavy global reflow
    setTimeout(() => {
      setTheme(checked ? 'dark' : 'light');
    }, 150);
  };

  return (
    <div
      className={cn(
        'scrollbar-hide h-full w-full shrink-0 flex-col overflow-y-auto border-r border-border-subtle bg-surface-1 py-6 sm:w-64',
        showMobileMenu ? 'flex' : 'hidden sm:flex',
      )}
    >
      <div className="flex flex-col gap-0">
        <div className="mb-3 mt-6 pl-6 text-xs capitalize tracking-wide text-content-muted">
          Profile
        </div>

        <SidebarButton
          label="General"
          isActive={activeTab === 'general'}
          onClick={() => {
            setActiveTab('general');
            setShowMobileMenu(false);
          }}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          modifiers={[restrictToVerticalAxis]}
        >
          <SortableContext
            items={sectionOrder}
            strategy={verticalListSortingStrategy}
          >
            {sectionOrder.map((id) => {
              const def = tabDefinitions[id];
              if (!def) return null;
              return (
                <SortableSidebarItem
                  key={id}
                  id={id}
                  label={def.label}
                  disabled={def.disabled}
                  isActive={activeTab === id}
                  onClick={() => {
                    setActiveTab(id);
                    setShowMobileMenu(false);
                  }}
                />
              );
            })}
          </SortableContext>
        </DndContext>

        <div className="mb-3 mt-6 pl-6 text-xs capitalize tracking-wide text-content-muted">
          Account
        </div>

        <div className="flex items-center justify-between py-2.5 pl-10 pr-6 text-sm text-content-muted">
          <span>Dark Mode</span>
          <Switch
            checked={mounted ? isDark : false}
            onCheckedChange={handleThemeToggle}
            className="data-[state=checked]:bg-[#0A84FF]"
          />
        </div>

        <SidebarButton
          label="Personal Domain"
          isActive={activeTab === 'personal_domain'}
          onClick={() => {
            setActiveTab('personal_domain');
            setShowMobileMenu(false);
          }}
        />
        <SidebarButton
          label="Print Profile"
          isActive={activeTab === 'print'}
          onClick={() => {
            setActiveTab('print');
            setShowMobileMenu(false);
          }}
        />
        <SidebarButton
          label="Settings"
          isActive={activeTab === 'settings'}
          onClick={() => {
            setActiveTab('settings');
            setShowMobileMenu(false);
          }}
        />
      </div>
    </div>
  );
}
