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
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';
import { SortableSidebarItem } from './SortableSidebarItem';
import { SidebarButton } from './SidebarButton';
import React, { useState } from 'react';
import { motion } from 'framer-motion';

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

  const accountTabs = ['personal_domain', 'print', 'import_data', 'settings'];
  const [activeGroup, setActiveGroup] = useState<'profile' | 'account'>(
    accountTabs.includes(activeTab) ? 'account' : 'profile',
  );

  React.useEffect(() => {
    setActiveGroup(accountTabs.includes(activeTab) ? 'account' : 'profile');
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleGroupChange = (group: 'profile' | 'account') => {
    setActiveGroup(group);
    if (group === 'profile' && accountTabs.includes(activeTab)) {
      setActiveTab('general');
    } else if (group === 'account' && !accountTabs.includes(activeTab)) {
      setActiveTab('personal_domain');
    }
  };

  const groups = [
    { id: 'profile', label: 'Profile' },
    { id: 'account', label: 'Account' },
  ] as const;

  return (
    <div
      className={cn(
        'scrollbar-hide h-full w-full shrink-0 flex-col overflow-y-auto border-r border-border-subtle bg-surface-1 sm:w-64',
        showMobileMenu ? 'flex' : 'hidden sm:flex',
      )}
    >
      <div className="flex w-full items-center border-b border-border-strong px-4 pt-6">
        {groups.map((group) => (
          <div key={group.id} className="flex flex-1 justify-center">
            <button
              onClick={() => handleGroupChange(group.id)}
              className={`relative cursor-default pb-3 text-center text-[14px] transition-all ${
                activeGroup === group.id
                  ? 'text-content-primary'
                  : 'text-content-muted'
              }`}
            >
              {group.label}
              {activeGroup === group.id && (
                <motion.div
                  layoutId="profileTabIndicator"
                  className="absolute -bottom-[1px] -left-4 -right-4 h-[1px] bg-action-primary"
                />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-0 py-4">
        {activeGroup === 'profile' ? (
          <>
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
              <div className="flex flex-col">
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
              </div>
            </DndContext>
          </>
        ) : (
          <>
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
              label="Import Data"
              isActive={activeTab === 'import_data'}
              onClick={() => {
                setActiveTab('import_data');
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
          </>
        )}
      </div>
    </div>
  );
}
