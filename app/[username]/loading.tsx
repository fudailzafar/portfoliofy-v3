export default function LoadingUsernamePage() {
  return (
    <section
      className="mx-auto my-8 w-full max-w-xl space-y-8 px-6 md:px-4 print:space-y-4"
      aria-label="Resume Content"
    >
      <div className="mb-8">
        <header className="flex items-center gap-4 md:gap-6">
          <div className="size-20 shrink-0 animate-pulse rounded-full bg-surface-3 md:size-24" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-48 animate-pulse rounded bg-surface-3" />
            <div className="h-4 w-72 animate-pulse rounded bg-surface-3" />
            <div className="flex gap-x-2 pt-1">
              <div className="h-6 w-6 animate-pulse rounded-md bg-surface-3" />
              <div className="h-6 w-6 animate-pulse rounded-md bg-surface-3" />
              <div className="h-6 w-6 animate-pulse rounded-md bg-surface-3" />
            </div>
          </div>
        </header>
      </div>

      <div className="flex flex-col gap-6">
        <section className="flex min-h-0 flex-col gap-y-3">
          <div className="h-6 w-24 animate-pulse rounded bg-surface-3" />
          <div className="h-20 w-full animate-pulse rounded bg-surface-3" />
        </section>
      </div>
    </section>
  );
}
