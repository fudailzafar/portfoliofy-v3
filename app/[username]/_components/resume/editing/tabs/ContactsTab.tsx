'use client';

import { useResumeStore } from '@/store/useResumeStore';
import { useTabEditor } from '@/hooks/useTabEditor';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { MessageCircle, ArrowUpRight } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { buildContactUrl, extractUsername } from '@/utils/extractUsername';
import { EditDeleteButtons } from '../EditDeleteButtons';
import { TabHeader } from '../TabHeader';
import { TabFormActions } from '../TabFormActions';
import { EmptyState } from '../EmptyState';
import { SortButtons } from '../SortButtons';

export function ContactsTab({
  setProjectToDelete,
}: {
  setProjectToDelete: (id: string) => void;
}) {
  const resume = useResumeStore((state) => state.resume);
  const updateResume = useResumeStore((state) => state.updateResume);
  const {
    view: view,
    setView: setView,
    current: current,
    setCurrent: setCurrent,
  } = useTabEditor<any>();

  if (!resume) return null;
  const items = resume.contacts || [];

  const handleSave = () => {
    if (!current?.platform || !current?.link) return;

    const isEdit = !!current.id;
    const newItem = isEdit
      ? current
      : { ...current, id: Date.now().toString() };

    const newItems = isEdit
      ? items.map((c: any) => (c.id === newItem.id ? newItem : c))
      : [...items, newItem];

    updateResume({ contacts: newItems });
    setView('list');
    setCurrent(null);
  };

  const handleToggleVisibility = (item: any) => {
    const newItems = items.map((c: any) =>
      c.id === item.id ? { ...c, hidden: !c.hidden } : c,
    );
    updateResume({ contacts: newItems });
  };

  return (
    <div className="mx-auto flex max-w-3xl flex-col">
      <TabHeader
        title="Contact"
        showAddButton={view === 'list'}
        onAdd={() => {
          setCurrent({
            platform: '',
            link: '',
            type: 'Social',
          });
          setView('form');
        }}
        addButtonText="Add link"
      />

      {view === 'list' && items.length === 0 && (
        <EmptyState
          icon={MessageCircle}
          buttonText="+ Add Contact"
          onClick={() => {
            setCurrent({
              platform: '',
              link: '',
              type: 'Social',
            });
            setView('form');
          }}
        />
      )}

      {view === 'list' && items.length > 0 && (
        <div className="space-y-8">
          {items.map((c: any, index: number) => (
            <div
              key={c.id || c.platform}
              className="flex flex-col gap-4 sm:flex-row sm:gap-12"
            >
              <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-32">
                {c.platform}
              </div>

              <div className="flex flex-1 flex-col items-start justify-start">
                <div className={`w-full transition-all duration-200 ${c.hidden ? 'opacity-50 blur-[1px]' : ''}`}>
                  <a
                    href={buildContactUrl(c.link, c.platform)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block hover:underline hover:underline-offset-4"
                  >
                    <span className="text-sm font-semibold text-content-primary">
                      {extractUsername(c.link, c.platform)}
                      <ArrowUpRight className="relative -top-0.5 ml-1 inline-block h-4 w-4 text-content-primary" />
                    </span>
                  </a>
                </div>

                <EditDeleteButtons
                  isHidden={c.hidden}
                  onToggleVisibility={() => handleToggleVisibility(c)}
                  onEdit={() => {
                    setCurrent({
                      ...c,
                      type: [
                        'Website',
                        'Email',
                        'LinkedIn',
                        'GitHub',
                        'X',
                        'Threads',
                        'Figma',
                        'Instagram',
                        'Bluesky',
                        'Mastodon',
                      ].includes(c.platform)
                        ? c.platform
                        : 'Custom',
                      username: extractUsername(c.link, c.platform),
                    });
                    setView('form');
                  }}
                  onDelete={() => setProjectToDelete(c.id)}
                >
                  <SortButtons
                    canMoveUp={index > 0}
                    canMoveDown={index < items.length - 1}
                    onMoveUp={() => {
                      const newItems = [...items];
                      [newItems[index - 1], newItems[index]] = [
                        newItems[index],
                        newItems[index - 1],
                      ];
                      updateResume({ contacts: newItems });
                    }}
                    onMoveDown={() => {
                      const newItems = [...items];
                      [newItems[index], newItems[index + 1]] = [
                        newItems[index + 1],
                        newItems[index],
                      ];
                      updateResume({ contacts: newItems });
                    }}
                  />
                </EditDeleteButtons>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'form' && current && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-[13px] text-content-muted">Type*</Label>
              <Select
                value={current.type || 'Custom'}
                onValueChange={(val) => {
                  const isCustom = val === 'Custom';
                  setCurrent({
                    ...current,
                    type: val,
                    platform: isCustom ? current.platform : val,
                    link: !isCustom
                      ? buildContactUrl(current.username || '', val)
                      : current.link,
                  });
                }}
              >
                <SelectTrigger className="h-10 text-[14px]">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    'Custom',
                    'Website',
                    'Email',
                    'LinkedIn',
                    'GitHub',
                    'X',
                    'Threads',
                    'Figma',
                    'Instagram',
                    'Bluesky',
                    'Mastodon',
                  ].map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {current.type === 'Custom' && (
              <div className="space-y-2">
                <Label className="text-[13px] text-content-muted">
                  Name of platform*
                </Label>
                <Input
                  value={current.platform || ''}
                  onChange={(e) =>
                    setCurrent({
                      ...current,
                      platform: e.target.value,
                    })
                  }
                  className="h-10 text-[14px]"
                />
              </div>
            )}

            {current.type === 'Custom' ? (
              <>
                <div className="space-y-2">
                  <Label className="text-[13px] text-content-muted">
                    Username*
                  </Label>
                  <Input
                    value={current.username || ''}
                    onChange={(e) => {
                      const newUsername = e.target.value;
                      setCurrent({
                        ...current,
                        username: newUsername,
                      });
                    }}
                    className="h-10 text-[14px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] text-content-muted">URL*</Label>
                  <Input
                    value={current.link || ''}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setCurrent({
                        ...current,
                        link: newUrl,
                      });
                    }}
                    className="h-10 text-[14px]"
                  />
                </div>
              </>
            ) : current.type === 'Website' ? (
              <div className="space-y-2">
                <Label className="text-[13px] text-content-muted">
                  Website URL*
                </Label>
                <Input
                  value={current.link || ''}
                  onChange={(e) => {
                    const newUrl = e.target.value;
                    setCurrent({
                      ...current,
                      link: newUrl,
                      username: extractUsername(newUrl, current.platform || ''),
                    });
                  }}
                  className="h-10 text-[14px]"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label className="text-[13px] text-content-muted">
                  Username or Profile URL*
                </Label>
                <Input
                  value={current.username || ''}
                  onChange={(e) => {
                    const newUsername = e.target.value;
                    setCurrent({
                      ...current,
                      username: newUsername,
                      link: buildContactUrl(
                        newUsername,
                        current.platform || '',
                      ),
                    });
                  }}
                  className="h-10 text-[14px]"
                />
              </div>
            )}
          </div>

          <TabFormActions
            onCancel={() => setView('list')}
            onSave={handleSave}
            isSaveDisabled={!current.platform || !current.link}
          />
        </div>
      )}
    </div>
  );
}
