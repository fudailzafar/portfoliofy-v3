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
          2. Add the stuff you're passionate about, like side projects or writing.
        </li>
      </ol>

      <div className="pt-2">
        <Button
          onClick={handleOpenEditor}
          className="bg-surface-2 text-content-primary hover:bg-surface-3 border-none shadow-none font-medium h-10 px-5"
        >
          Add your first work experience
        </Button>
      </div>
    </div>
  );
}
