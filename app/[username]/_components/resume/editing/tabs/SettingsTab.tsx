'use client';

import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface SettingsTabProps {
  onDeleteAccount: () => void;
}

export function SettingsTab({ onDeleteAccount }: SettingsTabProps) {
  const { theme, setTheme } = useTheme();

  const getThemeDescription = () => {
    switch (theme) {
      case 'light':
        return 'Always appears light';
      case 'dark':
        return 'Always appears dark';
      case 'system':
      default:
        return 'Inherits OS dark mode';
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-2xl font-bold text-content-primary">Settings</h2>
      </div>
      <div className="space-y-10">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <h4 className="text-sm text-content-primary">Appearance</h4>
                <p className="text-xs text-content-muted">
                  {getThemeDescription()}
                </p>
              </div>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger className="w-[120px] bg-transparent text-content-primary">
                  <SelectValue placeholder="System" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">System</SelectItem>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-red-200 bg-red-50/50 p-4 shadow-sm dark:border-red-900/50 dark:bg-red-900/20 sm:flex-row sm:items-center">
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-400">
                  Danger Zone
                </h4>
                <p className="text-xs text-red-600/80 dark:text-red-300/80">
                  Permanently delete your account and all associated data. This
                  action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={onDeleteAccount}
                className="w-full whitespace-nowrap rounded-md bg-red-600 px-6 text-surface-1 shadow-sm hover:bg-red-700 sm:w-auto dark:text-white"
              >
                Delete Account
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
