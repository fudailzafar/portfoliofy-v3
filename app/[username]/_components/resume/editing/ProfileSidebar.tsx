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

  return (
    <div
      className={cn(
        'scrollbar-hide h-full w-full shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white py-6 sm:w-64',
        showMobileMenu ? 'flex' : 'hidden sm:flex',
      )}
    >
      <div className="flex flex-col gap-0">
        <div className="mb-3 mt-0 pl-6 text-sm font-medium capitalize tracking-wide text-gray-400">
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

        <div className="mb-3 mt-6 pl-6 text-xs capitalize tracking-wide text-gray-400">
          Account
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
