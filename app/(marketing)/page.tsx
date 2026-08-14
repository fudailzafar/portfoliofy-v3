import { HomeHero } from '@/components/layout/HomeHero';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { auth } from '@/auth';
import { getUsernameById } from '@/lib/server/dbActions';
import { ClaimDialog } from '@/components/auth/ClaimDialog';
import { Grab, MousePointer2 } from 'lucide-react';

const ResumePaper = ({ className }: { className?: string }) => (
  <div
    className={`flex w-[90%] flex-col gap-6 rounded-2xl border border-border-strong bg-surface-1 p-5 text-[9px] shadow-sm sm:w-[95%] sm:p-7 sm:text-[10px] ${
      className || ''
    }`}
  >
    <div className="flex gap-4 sm:gap-8">
      <div className="w-[35%] shrink-0">
        <div className="mb-0.5 text-[10px] font-semibold text-content-primary sm:text-[12px]">
          Jeff Hamada
        </div>
        <div className="text-content-muted">Artist in Vancouver, He/Him</div>
      </div>
      <div className="w-full">
        <div className="mb-4 text-[10px] font-semibold text-content-primary sm:text-[12px]">
          Work Experience
        </div>

        <div className="mb-5 flex gap-3 sm:gap-5">
          <div className="w-16 shrink-0 whitespace-nowrap font-medium text-content-muted">
            2008 — Now
          </div>
          <div className="flex-1">
            <div className="mb-0.5 text-[10px] font-semibold text-content-primary sm:text-[12px]">
              Founder at Booooooom
            </div>
            <div className="mb-1.5 text-content-muted">Vancouver, Canada</div>
            <div className="leading-relaxed text-content-muted">
              Clients: Mercedes, Red Bull, MTV, Adobe, VICE, Sony, Converse,
              WeTransfer, Levi&apos;s, Oakley, Native Shoes, Flexfit, Ray Ban,
              Vitamin Water, Telus, Jameson, Herschel Supply, Nikon.
            </div>
          </div>
        </div>

        <div className="flex gap-3 sm:gap-5">
          <div className="w-16 shrink-0 whitespace-nowrap font-medium text-content-muted">
            2004 — 2005
          </div>
          <div className="flex-1">
            <div className="mb-0.5 text-[10px] font-semibold text-content-primary sm:text-[12px]">
              Graphic Designer at Electronic Arts
            </div>
            <div className="mb-1.5 text-content-muted">Vancouver, Canada</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default async function Home() {
  const session = await auth();
  const userId = session?.user?.id;

  let needsClaim = false; // CHANGE THIS TO TRUE AND COMMENT
  // THE BELOW CODE FOR ENTERING CLAIM DIALOG
  if (userId) {
    const existingUsername = await getUsernameById(userId);
    if (!existingUsername) {
      needsClaim = true;
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-1">
      {needsClaim && <ClaimDialog />}
      <main className="flex flex-1 flex-col items-center font-sans text-content-primary">
        <div className="flex w-full max-w-[540px] flex-col gap-6 px-6 pb-32 pt-24">
          {/* Hero Section */}
          <HomeHero />
          {/* Feature 1: Create a beautiful profile */}
          <div className="relative flex h-[384px] flex-col overflow-hidden rounded-[36px] bg-surface-2 p-5 pb-0 sm:h-[384px] sm:p-8 sm:pb-0">
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes drag-and-drop {
                0%, 100% { transform: translateY(0px) scale(1.05); }
                50% { transform: translateY(-28px) scale(1.05); }
              }
              .animate-drag {
                animation: drag-and-drop 3s ease-in-out infinite;
              }
            `,
              }}
            />
            <div className="mb-8">
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-content-primary">
                Create a beautiful profile
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-content-muted">
                A fun and intuitive{' '}
                <Link
                  href="/"
                  className="cursor-text text-inherit no-underline hover:text-inherit"
                >
                  editor
                </Link>{' '}
                allows you to create a beautiful profile in just a couple
                minutes.
              </p>
            </div>

            {/* Mock UI */}
            <div className="relative -mx-4 flex flex-1 flex-col justify-start overflow-hidden px-4">
              <div className="pointer-events-none absolute inset-0 z-20"></div>

              <div className="mb-4 px-4 text-[24px] tracking-tight text-content-muted">
                Side Projects
              </div>

              <div className="animate-drag relative z-10 mx-auto flex w-full max-w-[400px] items-center justify-between rounded-[18px] border border-border-strong bg-surface-1 p-3 shadow-xl dark:shadow-none sm:p-4">
                <span className="truncate pr-2 text-[16px] tracking-tight text-content-primary sm:text-[20px]">
                  Work Experience
                </span>
                <div className="relative flex flex-col gap-[3px] opacity-40 dark:opacity-60">
                  <div className="h-[2px] w-5 rounded-full bg-content-muted"></div>
                  <div className="h-[2px] w-5 rounded-full bg-content-muted"></div>

                  {/* Grabbing Hand SVG */}
                  <div className="absolute -bottom-6 -right-2 h-8 w-8 opacity-100">
                    <Grab
                      className="stroke-black text-white dark:stroke-white dark:text-black"
                      strokeWidth={1.5}
                      fill="currentColor"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 px-4 text-[24px] tracking-tight text-content-muted">
                Features
              </div>
              <div className="mt-6 px-4 text-[24px] tracking-tight text-content-muted">
                Writing
              </div>
            </div>
          </div>

          {/* Feature 2: Make it collaborative */}
          <div className="relative flex h-[384px] flex-col overflow-hidden rounded-[36px] bg-surface-2 p-5 pb-0 sm:h-[384px] sm:p-8 sm:pb-0">
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes cursor-tag {
                0%, 20% { transform: translate(0px, 0px); }
                50%, 70% { transform: translate(-3px, -3px); }
                90%, 100% { transform: translate(0px, 0px); }
              }
              .animate-cursor-tag {
                animation: cursor-tag 3.5s ease-in-out infinite;
              }
              @keyframes tag-bubble {
                0%, 35% { opacity: 0; transform: translateY(6px) scale(0.96); }
                50%, 75% { opacity: 1; transform: translateY(0px) scale(1); }
                90%, 100% { opacity: 0; transform: translateY(6px) scale(0.96); }
              }
              .animate-tag-bubble {
                animation: tag-bubble 3.5s ease-in-out infinite;
              }
            `,
              }}
            />
            <div className="mb-8">
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-content-primary">
                Make it collaborative
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-content-muted">
                Profiles are made even richer when you tag collaborators in
                experiences.
              </p>
            </div>

            <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden">
              <div className="relative flex w-full max-w-[400px] flex-col justify-between gap-6 rounded-[18px] border border-border-strong bg-surface-1 p-4 shadow-xl dark:shadow-none sm:p-5">
                <div className="relative">
                  <div className="text-[16px] font-semibold tracking-tight text-content-primary sm:text-[20px]">
                    Product Designer at Quip
                  </div>
                  <div className="text-[14px] text-content-muted sm:text-[16px]">
                    San Francisco, CA
                  </div>

                  <div className="animate-tag-bubble bg-content-primary/80 pointer-events-none absolute left-8 top-4 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-medium text-surface-1 shadow-lg backdrop-blur-sm">
                    Mia Chen
                  </div>
                </div>

                <div className="relative flex items-center gap-2">
                  <div className="flex -space-x-2">
                    <div className="size-7 shrink-0 overflow-hidden rounded-full bg-surface-3 ring-2 ring-surface-1 sm:size-8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://api.dicebear.com/10.x/glyphs/svg?seed=Jeff"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="size-7 shrink-0 overflow-hidden rounded-full bg-surface-3 ring-2 ring-surface-1 sm:size-8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://api.dicebear.com/10.x/glyphs/svg?seed=Mia"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="size-7 shrink-0 overflow-hidden rounded-full bg-surface-3 ring-2 ring-surface-1 sm:size-8">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://api.dicebear.com/10.x/glyphs/svg?seed=Alex"
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>

                  <div className="animate-cursor-tag pointer-events-none">
                    <MousePointer2
                      className="h-4 w-4 stroke-black text-white dark:stroke-white dark:text-black"
                      strokeWidth={1.5}
                      fill="currentColor"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Print it out */}
          <div className="relative flex h-[384px] flex-col overflow-hidden rounded-[36px] bg-surface-2 p-5 pb-0 sm:h-[384px] sm:p-8 sm:pb-0">
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes print-slide {
                0% { transform: translateY(100%); opacity: 1; }
                60% { transform: translateY(0%); opacity: 1; }
                100% { transform: translateY(0%); opacity: 1; }
              }
              .animate-print {
                animation: print-slide 2.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
              }
            `,
              }}
            />
            <div className="mb-8">
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-content-primary">
                Print it out
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-content-muted">
                Profiles are print ready, with optimized typography and only the
                relevant information shown.
              </p>
            </div>

            <div className="relative flex w-full flex-1 justify-center overflow-hidden">
              {/* Sheet underneath, peeking out slightly */}
              <ResumePaper className="absolute top-1 z-10 shadow-sm" />

              {/* Printing Paper (animated) */}
              <ResumePaper className="animate-print absolute top-0 z-20 shadow-md" />
            </div>
          </div>

          {/* Feature 4: Find who you're looking for */}
          <div className="relative flex h-[384px] flex-col overflow-hidden rounded-[36px] bg-surface-2 p-5 pb-0 sm:h-[384px] sm:p-8 sm:pb-0">
            <style
              dangerouslySetInnerHTML={{
                __html: `
              @keyframes cursor-blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
              .animate-blink {
                animation: cursor-blink 1s step-end infinite;
              }
            `,
              }}
            />
            <div className="mb-8">
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-content-primary">
                Find who you&apos;re looking for
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-content-muted">
                Search by title, location, and username.
              </p>
            </div>

            <div className="flex w-full flex-1 flex-col">
              <div className="mb-6 flex max-w-[95%] items-center rounded-full border bg-surface-1 px-3 py-2 shadow-sm dark:shadow-none sm:px-5 sm:py-3">
                <span className="flex items-center text-[15px] font-medium tracking-tight text-content-primary sm:text-[18px]">
                  Art director
                  <span className="animate-blink ml-0.5 inline-block h-[1.1em] w-[2px] bg-[#0085FF]"></span>
                </span>
              </div>

              <div className="space-y-4 px-1 sm:px-2">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="size-10 shrink-0 overflow-hidden rounded-full bg-surface-3 sm:size-12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://api.dicebear.com/10.x/glyphs/svg?seed=Lauren"
                      alt="Lauren"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[14px] text-content-muted dark:text-content-muted sm:text-[16px]">
                      Lauren Jochum
                    </div>
                    <div className="text-[13px] text-content-muted dark:text-content-muted sm:text-[15px]">
                      <strong className="text-content-primary">
                        Art director
                      </strong>{' '}
                      in Berkeley
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-30 sm:gap-4">
                  <div className="size-10 shrink-0 overflow-hidden rounded-full bg-surface-3 sm:size-12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://api.dicebear.com/10.x/glyphs/svg?seed=Skip"
                      alt="Skip"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[14px] text-content-muted dark:text-content-muted sm:text-[16px]">
                      Skip Hursh
                    </div>
                    <div className="text-[13px] text-content-muted dark:text-content-muted sm:text-[15px]">
                      <strong className="text-content-primary">
                        Art director
                      </strong>{' '}
                      in NYC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 5: Use it anywhere */}
          <div className="relative flex h-[384px] flex-col overflow-hidden rounded-[36px] bg-surface-2 p-5 pb-0 sm:h-[384px] sm:p-8 sm:pb-0">
            <div className="mb-6 sm:mb-8">
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-content-primary">
                Use it anywhere
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-content-muted">
                Add your link wherever your audience is.
              </p>
            </div>

            <div className="flex w-full flex-1 flex-col rounded-t-[16px] border border-b-0 border-border-strong bg-surface-1 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-none sm:p-8">
              <div className="mb-4 flex items-center gap-4 sm:gap-8">
                <div className="size-[64px] shrink-0 rounded-full bg-gradient-to-b from-[#9E2692] to-[#FAA958] p-[2px] sm:size-[84px] sm:p-[3px]">
                  <div className="h-full w-full rounded-full bg-surface-1 p-0.5">
                    <div className="h-full w-full overflow-hidden rounded-full bg-surface-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://api.dicebear.com/10.x/glyphs/svg?seed=Tom"
                        alt="Tom Chung"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-around gap-3 pr-0 text-center sm:justify-center sm:gap-6 sm:pr-4">
                  <div className="flex flex-col items-center">
                    <div className="text-[17px] font-semibold text-content-primary sm:text-[19px]">
                      54
                    </div>
                    <div className="text-[13px] tracking-tight text-content-primary sm:text-[14px]">
                      Posts
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-[17px] font-semibold text-content-primary sm:text-[19px]">
                      368
                    </div>
                    <div className="text-[13px] tracking-tight text-content-primary sm:text-[14px]">
                      Followers
                    </div>
                  </div>
                  <div className="hidden flex-col items-center sm:flex">
                    <div className="text-[17px] font-semibold text-content-primary sm:text-[19px]">
                      115
                    </div>
                    <div className="text-[13px] tracking-tight text-content-primary sm:text-[14px]">
                      Following
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-1 flex flex-col pb-4 leading-snug sm:pb-0">
                <span className="text-[15px] font-semibold text-content-primary sm:text-[16px]">
                  Tom Chung
                </span>
                <span className="text-[14px] text-content-muted sm:text-[15px]">
                  Architectural Designer
                </span>
                <span className="text-[14px] text-content-muted sm:text-[15px]">
                  portfoliofy.me/tom
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
