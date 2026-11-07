import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { extractUsername } from '@portfoliofy/shared/extractUsername';
import { useResumeList } from '@portfoliofy/shared/hooks/useResumeList';
import { Button } from '@/components/Button';
import { confirmDelete, EntryRow, ListFrame } from '@/components/EntryList';
import { Screen } from '@/components/Screen';

export default function Contacts() {
  const router = useRouter();
  const {
    items,
    handleMoveUp,
    handleMoveDown,
    handleToggleVisibility,
    handleDelete,
  } = useResumeList<any>('contacts');

  return (
    <Screen
      footer={
        <Button
          title="Add contact"
          onPress={() =>
            router.push({
              pathname: '/edit/contact/[id]',
              params: { id: 'new' },
            } as never)
          }
        />
      }
    >
      <ListFrame
        empty={items.length === 0}
        emptyText="Let others know how to reach you"
      >
        <View style={styles.list}>
          {items.map((contact: any, index: number) => {
            const prevItem = index > 0 ? items[index - 1] : null;
            const nextItem = index < items.length - 1 ? items[index + 1] : null;
            return (
              <EntryRow
                key={contact.id ?? index}
                title={contact.platform}
                subtitle={` ${extractUsername(contact.link, contact.platform)}`}
                hidden={contact.hidden}
                onPress={() =>
                  router.push({
                    pathname: '/edit/contact/[id]',
                    params: { id: contact.id },
                  } as never)
                }
                actions={[
                  {
                    label: contact.hidden
                      ? 'Show on profile'
                      : 'Hide from profile',
                    onPress: () => handleToggleVisibility(contact),
                  },
                  ...(prevItem
                    ? [
                        {
                          label: 'Move up',
                          onPress: () => handleMoveUp(contact, prevItem),
                        },
                      ]
                    : []),
                  ...(nextItem
                    ? [
                        {
                          label: 'Move down',
                          onPress: () => handleMoveDown(contact, nextItem),
                        },
                      ]
                    : []),
                  {
                    label: 'Delete…',
                    danger: true,
                    onPress: () =>
                      confirmDelete('contact', () => handleDelete(contact.id)),
                  },
                ]}
              />
            );
          })}
        </View>
      </ListFrame>
    </Screen>
  );
}

const styles = StyleSheet.create({ list: {} });
