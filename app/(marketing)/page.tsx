import { HomeHero } from '@/components/layout/HomeHero';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { auth } from '@/auth';
import { getUsernameById } from '@/lib/server/dbActions';
import { ClaimDialog } from '@/components/auth/ClaimDialog';
import { Grab } from 'lucide-react';

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
        <div className="flex w-full max-w-[500px] flex-col gap-6 px-6 pb-32 pt-24">
          {/* Hero Section */}
          <HomeHero />
          {/* Feature 1: Create a beautiful profile */}
          <div className="relative flex h-[340px] flex-col overflow-hidden rounded-[24px] bg-surface-2 p-5 pb-0 sm:h-[340px] sm:p-8 sm:pb-0">
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
              <h3 className="mb-1.5 text-[17px] font-bold text-content-primary">
                Create a beautiful profile
              </h3>
              <p className="text-[15px] leading-snug text-content-muted">
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
              <div className="pointer-events-none absolute inset-0 z-20 "></div>

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
                      className="text-white dark:text-black stroke-black dark:stroke-white"
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

          {/* Feature 2: Print it out */}
          <div className="relative flex h-[340px] flex-col overflow-hidden rounded-[24px] bg-surface-2 p-5 pb-0 sm:h-[340px] sm:p-8 sm:pb-0">
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
              <h3 className="mb-1.5 text-[17px] font-bold text-content-primary">
                Print it out
              </h3>
              <p className="text-[15px] leading-snug text-content-muted">
                Profiles are print ready, with optimized typography and only the
                relevant information shown.
              </p>
            </div>

            <div className="relative flex flex-1 w-full justify-center overflow-hidden">
              {/* Fixed Stack Layers (already printed) */}
              <ResumePaper className="absolute top-0 z-10 rotate-[-1.5deg] translate-x-1 translate-y-2 opacity-50 shadow-sm" />
              <ResumePaper className="absolute top-0 z-10 rotate-[1.5deg] -translate-x-1 translate-y-1 shadow-sm" />
              <ResumePaper className="absolute top-0 z-10 shadow-sm" />

              {/* Printing Paper (animated) */}
              <ResumePaper className="animate-print absolute top-0 z-20 shadow-md" />
            </div>
          </div>

          {/* Feature 3: Find who you're looking for */}
          <div className="relative flex h-[340px] flex-col overflow-hidden rounded-[24px] bg-surface-2 p-5 pb-0 sm:h-[340px] sm:p-8 sm:pb-0">
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
              <h3 className="mb-1.5 text-[17px] font-bold text-content-primary">
                Find who you&apos;re looking for
              </h3>
              <p className="text-[15px] leading-snug text-content-muted">
                Search by title, location, and username.
              </p>
            </div>

            <div className="flex flex-1 w-full flex-col">
              <div className="mb-6 flex max-w-[95%] items-center rounded-full border bg-surface-1 px-3 py-2 shadow-sm dark:shadow-none sm:px-5 sm:py-3">
                <span className="flex items-center text-[15px] font-medium tracking-tight text-content-primary sm:text-[18px]">
                  Art director
                  <span className="animate-blink ml-0.5 inline-block h-[1.1em] w-[2px] bg-blue-500"></span>
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
                      <strong className="text-content-muted">
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
                      <strong className="text-content-muted">
                        Art director
                      </strong>{' '}
                      in NYC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Use it anywhere */}
          <div className="flex h-[340px] flex-col overflow-hidden rounded-[24px] bg-surface-2 p-5 pb-0 sm:h-[340px] sm:p-8 sm:pb-0">
            <div className="mb-6 sm:mb-8">
              <h3 className="mb-1.5 text-[17px] font-bold text-content-primary">
                Use it anywhere
              </h3>
              <p className="text-[15px] leading-snug text-content-muted">
                Add your link wherever your audience is.
              </p>
            </div>

            <div className="flex flex-1 w-full flex-col rounded-t-[16px] border border-b-0 border-border-strong bg-surface-1 p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:shadow-none sm:p-8">
              <div className="mb-4 flex items-center gap-4 sm:gap-8">
                <div className="size-[64px] shrink-0 rounded-full bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] to-[#d62976] p-[2px] sm:size-[84px] sm:p-[3px]">
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
                <span className="text-[14px] text-action-primary sm:text-[15px]">
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
