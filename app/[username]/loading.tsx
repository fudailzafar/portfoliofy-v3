export default function LoadingUsernamePage() {
  return (
    <section
      className="mx-auto my-8 w-full max-w-2xl space-y-8 bg-white px-4 print:space-y-4"
      aria-label="Resume Content"
    >
      <header className="flex items-center justify-between">
        <div className="flex-1 space-y-1.5">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-96 animate-pulse rounded bg-gray-200" />
          <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
          <div className="flex gap-x-1 pt-1">
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
            <div className="h-8 w-8 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="h-28 w-28 animate-pulse rounded-full bg-gray-200" />
      </header>

      <div className="flex flex-col gap-6">
        <section className="flex min-h-0 flex-col gap-y-3">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
          <div className="h-20 w-full animate-pulse rounded bg-gray-200" />
        </section>
      </div>
    </section>
  );
}
