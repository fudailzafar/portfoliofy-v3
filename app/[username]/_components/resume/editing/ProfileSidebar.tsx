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
import {
  restrictToVerticalAxis,
  restrictToParentElement,
} from '@dnd-kit/modifiers';
import { cn } from '@/lib/utils';
import { SortableSidebarItem } from './SortableSidebarItem';
import { SidebarButton } from './SidebarButton';
import React, { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useResumeStore } from '@/store/useResumeStore';
import { User, Pencil, Bolt } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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

const WRITING_TABS = ['writing_all', 'writing_published', 'writing_drafts'];

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

  const accountTabs = [
    'personal_domain',
    'insights',
    'print',
    'import_data',
    'settings',
  ];

  const groupOf = (tab: string): 'profile' | 'writing' | 'account' =>
    accountTabs.includes(tab)
      ? 'account'
      : WRITING_TABS.includes(tab)
        ? 'writing'
        : 'profile';

  const [activeGroup, setActiveGroup] = useState(groupOf(activeTab));

  React.useEffect(() => {
    setActiveGroup(groupOf(activeTab));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const handleGroupChange = (group: 'profile' | 'writing' | 'account') => {
    setActiveGroup(group);
    if (group === 'profile' && groupOf(activeTab) !== 'profile') {
      setActiveTab('general');
    } else if (group === 'writing' && groupOf(activeTab) !== 'writing') {
      setActiveTab('writing_all');
    } else if (group === 'account' && groupOf(activeTab) !== 'account') {
      setActiveTab('personal_domain');
    }
  };

  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const isWritingEnabled = resume?.preferences?.writingEnabled !== false;

  const groups = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'writing', label: 'Writing', icon: Pencil },
    { id: 'account', label: 'Account', icon: Bolt },
  ] as const;

  return (
    <div
      className={cn(
        'h-full w-full shrink-0 overflow-hidden border-r border-border-subtle bg-surface-1 sm:w-80',
        showMobileMenu ? 'flex' : 'hidden sm:flex',
      )}
    >
      {/* Icon rail */}
      <div className="flex w-14 shrink-0 flex-col items-center gap-3 border-r border-border-subtle pb-6 pt-4">
        {groups.map((group) => {
          const Icon = group.icon;
          const isActive = activeGroup === group.id;
          return (
            <TooltipProvider key={group.id} delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => handleGroupChange(group.id)}
                    aria-label={group.label}
                    className={cn(
                      'flex size-10 items-center justify-center rounded-full transition-colors',
                      isActive ? 'text-content-primary' : 'text-content-muted',
                    )}
                  >
                    <Icon
                      className="size-[18px] sm:size-6"
                      strokeWidth={isActive ? 2.25 : 1.75}
                    />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>{group.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          );
        })}
      </div>

      {/* Section list */}
      <div className="scrollbar-hide flex flex-1 flex-col overflow-hidden">
        <div className="px-6 pb-4 pt-6">
          <h2 className="font-regular text-[14px] text-content-primary sm:text-[18px]">
            {groups.find((g) => g.id === activeGroup)?.label}
          </h2>
        </div>

        <div className="scrollbar-hide flex flex-1 flex-col overflow-y-auto py-1">
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
                modifiers={[restrictToVerticalAxis, restrictToParentElement]}
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
          ) : activeGroup === 'writing' ? (
            <>
              <div className="mb-2 ml-4 flex items-center justify-between px-6 py-4">
                <span className="text-[14px] text-content-secondary">
                  Enable writing tab
                </span>
                <Switch
                  checked={isWritingEnabled}
                  onCheckedChange={(checked) =>
                    updateResume({
                      preferences: {
                        ...(resume?.preferences || {}),
                        writingEnabled: checked,
                      },
                    })
                  }
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>

              <SidebarButton
                label="All"
                isActive={activeTab === 'writing_all'}
                onClick={() => {
                  setActiveTab('writing_all');
                  setShowMobileMenu(false);
                }}
              />
              <SidebarButton
                label="Published"
                isActive={activeTab === 'writing_published'}
                onClick={() => {
                  setActiveTab('writing_published');
                  setShowMobileMenu(false);
                }}
              />
              <SidebarButton
                label="Drafts"
                isActive={activeTab === 'writing_drafts'}
                onClick={() => {
                  setActiveTab('writing_drafts');
                  setShowMobileMenu(false);
                }}
              />
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
                label="Insights"
                isActive={activeTab === 'insights'}
                onClick={() => {
                  setActiveTab('insights');
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
    </div>
  );
}
