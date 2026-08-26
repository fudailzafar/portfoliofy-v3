interface PublicEmptyProfileStateProps {
  name: string;
}

export function PublicEmptyProfileState({
  name,
}: PublicEmptyProfileStateProps) {
  // Use just the first name if possible to make it friendlier
  const firstName = name ? name : 'This user';

  return (
    <div className="flex flex-col justify-center rounded-[24px] border border-border-strong bg-theme-border px-8 py-10 dark:border-none">
      <h2 className="text-base font-medium text-content-primary">
        Nothing here yet 🍃
      </h2>
      <p className="mt-2 text-[14px] text-content-secondary">
        It looks like {firstName} is still working on it.
      </p>
    </div>
  );
}
