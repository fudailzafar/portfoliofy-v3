import { useResumeStore } from '@/store/useResumeStore';

export function EmptyProfileState() {
  const setActiveTab = useResumeStore((state) => state.setActiveTab);

  const handleOpenEditor = () => {
    setActiveTab('work');
    window.dispatchEvent(new CustomEvent('open-editor'));
  };

  return (
    <div className="mt-8 flex flex-col space-y-6 rounded-2xl border border-border-subtle bg-surface-1 p-10">
      <h2 className="text-base font-medium text-content-primary">
        Welcome to your new profile! ✨
      </h2>

      <ol className="space-y-1 text-sm text-content-secondary">
        <li className="flex gap-2">
          1. Add the basics, like work experience or education.
        </li>
        <li className="flex gap-2">
          2. Add the stuff you&apos;re passionate about, like side projects or
          writing.
        </li>
        <li className="flex gap-2">
          3. Add images or videos to any experiences that need more detail.
        </li>
      </ol>

      <div className="flex flex-wrap gap-4 pt-2">
        <button
          onClick={handleOpenEditor}
          className="h-8 items-center justify-center rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
        >
          Add your first work experience
        </button>
        <button
          onClick={() => {
            setActiveTab('import_data');
            window.dispatchEvent(new CustomEvent('open-editor'));
          }}
          className="h-8 items-center justify-center rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-all active:bg-surface-2 dark:border-none dark:bg-border-subtle dark:active:bg-border-strong"
        >
          Upload resume
        </button>
      </div>
    </div>
  );
}
