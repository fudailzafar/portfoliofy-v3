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
    <div className="mx-auto flex max-w-2xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-xl sm:text-2xl font-bold text-content-primary">Settings</h2>
      </div>
      <div className="space-y-10">
        <div className="space-y-6 w-full min-w-0">
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

        <div className="space-y-6 w-full min-w-0">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1 pr-4">
                <h4 className="text-sm text-content-primary">Delete account</h4>
                <p className="text-xs text-content-muted">
                  Permanently delete your account and all associated data.
                </p>
              </div>
              <Button
                variant="outline"
                onClick={onDeleteAccount}
                className="w-[120px] shrink-0 border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 dark:border-red-900/60 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/40 dark:hover:border-red-800 dark:hover:text-red-300 transition-colors"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
