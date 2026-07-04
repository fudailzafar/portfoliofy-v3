import { Button } from '@/components/ui/button';
import { useResumeStore } from '@/store/useResumeStore';

export function EmptyProfileState() {
  const setActiveTab = useResumeStore((state) => state.setActiveTab);

  const handleOpenEditor = () => {
    setActiveTab('work');
    window.dispatchEvent(new CustomEvent('open-editor'));
  };

  return (
    <div className="mt-8 flex flex-col space-y-6 px-4">
      <h2 className="text-base font-medium text-content-primary">
        Welcome to your new profile! ✨
      </h2>

      <ol className="space-y-4 text-sm text-content-secondary">
        <li className="flex gap-2">
          1. Add the basics, like work experience or education.
        </li>
        <li className="flex gap-2">
          2. Add the stuff you&apos;re passionate about, like side projects or
          writing.
        </li>
        <li className="flex gap-2">
          3. Add images or videos to any experiences that needs more details.
        </li>
      </ol>

      <div className="pt-2 flex flex-wrap gap-4">
        <Button
          onClick={handleOpenEditor}
          className="h-10 border-none bg-surface-2 px-5 font-medium text-content-primary shadow-none hover:bg-surface-3"
        >
          Add your first work experience
        </Button>
        <Button
          onClick={() => {
            setActiveTab('import_data');
            window.dispatchEvent(new CustomEvent('open-editor'));
          }}
          className="h-10 border-none bg-surface-2 px-5 font-medium text-content-primary shadow-none hover:bg-surface-3"
        >
          Upload resume
        </Button>
      </div>
    </div>
  );
}
