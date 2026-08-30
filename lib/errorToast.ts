import { toast } from 'sonner';

export type ErrorToastResult<T> = { ok: true; value: T } | { ok: false };

export async function withErrorToast<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<ErrorToastResult<T>> {
  try {
    const value = await action();
    return { ok: true, value };
  } catch (error) {
    toast.error(error instanceof Error ? error.message : fallbackMessage);
    return { ok: false };
  }
}
