'use client';

import { useTabEditor } from '@/hooks/useTabEditor';
import { useResumeList } from '@/hooks/useResumeList';
import { ListTabLayout } from '@/components/composite/ListTabLayout';
import { FormInput } from '@/components/ui/form-input';
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
import { TabFormActions } from '../TabFormActions';
import { SortButtons } from '../SortButtons';

export function ContactsTab({
  setProjectToDelete,
}: {
  setProjectToDelete: (id: string) => void;
}) {
  const {
    items: contacts,
    handleSave: saveContact,
    handleMoveUp,
    handleToggleVisibility,
  } = useResumeList<any>('contacts');

  const {
    view: contactsView,
    setView: setContactsView,
    current: currentContact,
    setCurrent: setCurrentContact,
  } = useTabEditor<any>();

  const handleSave = () => {
    if (!currentContact?.platform || !currentContact?.link) return;
    saveContact(currentContact);
    setContactsView('list');
    setCurrentContact(null);
  };

  return (
    <ListTabLayout
      title="Contact"
      view={contactsView}
      itemsLength={contacts.length}
      onAdd={() => {
        setCurrentContact({
          platform: '',
          link: '',
          type: 'Social',
        });
        setContactsView('form');
      }}
      addButtonText="Add link"
      emptyState={{
        icon: MessageCircle,
        buttonText: "+ Add Contact",
      }}
      renderList={() => (
        <>
          {contacts.map((c: any, index: number, array: any[]) => {
            const prevItem = index > 0 ? array[index - 1] : null;
            const nextItem = index < array.length - 1 ? array[index + 1] : null;

            return (
              <div
                key={c.id || c.platform}
                className="group flex flex-col gap-4 sm:flex-row sm:gap-12"
              >
                <div className="shrink-0 pt-0.5 text-sm text-content-muted sm:w-24">
                  {c.platform}
                </div>

                <div className="flex flex-1 flex-col items-start justify-start">
                  <div
                    className={`w-full transition-all duration-200 ${c.hidden ? 'opacity-50 blur-[1px]' : ''}`}
                  >
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
                      setCurrentContact({
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
                      setContactsView('form');
                    }}
                    onDelete={() => setProjectToDelete(c.id)}
                  >
                    <SortButtons
                      canMoveUp={!!prevItem}
                      canMoveDown={!!nextItem}
                      onMoveUp={() => handleMoveUp(c, prevItem)}
                      onMoveDown={() => handleMoveUp(c, nextItem)}
                    />
                  </EditDeleteButtons>
                </div>
              </div>
            );
          })}
        </>
      )}
      renderForm={() =>
        currentContact ? (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[13px] text-content-muted">Type*</Label>
                <Select
                  value={currentContact.type || 'Custom'}
                  onValueChange={(val) => {
                    const isCustom = val === 'Custom';
                    setCurrentContact({
                      ...currentContact,
                      type: val,
                      platform: isCustom ? currentContact.platform : val,
                      link: !isCustom
                        ? buildContactUrl(currentContact.username || '', val)
                        : currentContact.link,
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

              {currentContact.type === 'Custom' && (
                <div className="space-y-2">
                  <Label className="text-[13px] text-content-muted">
                    Name of platform*
                  </Label>
                  <Input
                    value={currentContact.platform || ''}
                    onChange={(e) =>
                      setCurrentContact({
                        ...currentContact,
                        platform: e.target.value,
                      })
                    }
                    className="h-10 text-[14px]"
                  />
                </div>
              )}

              {currentContact.type === 'Custom' ? (
                <>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-content-muted">
                      Username*
                    </Label>
                    <Input
                      value={currentContact.username || ''}
                      onChange={(e) => {
                        const newUsername = e.target.value;
                        setCurrentContact({
                          ...currentContact,
                          username: newUsername,
                        });
                      }}
                      className="h-10 text-[14px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[13px] text-content-muted">
                      URL*
                    </Label>
                    <Input
                      value={currentContact.link || ''}
                      onChange={(e) => {
                        const newUrl = e.target.value;
                        setCurrentContact({
                          ...currentContact,
                          link: newUrl,
                        });
                      }}
                      className="h-10 text-[14px]"
                    />
                  </div>
                </>
              ) : currentContact.type === 'Website' ? (
                <div className="space-y-2">
                  <Label className="text-[13px] text-content-muted">
                    Website URL*
                  </Label>
                  <Input
                    value={currentContact.link || ''}
                    onChange={(e) => {
                      const newUrl = e.target.value;
                      setCurrentContact({
                        ...currentContact,
                        link: newUrl,
                        username: extractUsername(
                          newUrl,
                          currentContact.platform || '',
                        ),
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
                    value={currentContact.username || ''}
                    onChange={(e) => {
                      const newUsername = e.target.value;
                      setCurrentContact({
                        ...currentContact,
                        username: newUsername,
                        link: buildContactUrl(
                          newUsername,
                          currentContact.platform || '',
                        ),
                      });
                    }}
                    className="h-10 text-[14px]"
                  />
                </div>
              )}
            </div>

            <TabFormActions
              onCancel={() => setContactsView('list')}
              onSave={handleSave}
              isSaveDisabled={
                !currentContact.platform || !currentContact.link
              }
            />
          </>
        ) : null
      }
    />
  );
}
