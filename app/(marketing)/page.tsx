import { HomeHero } from '@/components/layout/HomeHero';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 flex-col items-center font-sans text-gray-900">
        <div className="flex w-full max-w-[500px] flex-col gap-6 px-6 pb-32 pt-24">
          {/* Hero Section */}
          <HomeHero />
          {/* Feature 1: Create a beautiful profile */}
          <div className="relative flex flex-col overflow-hidden rounded-[24px] bg-[#f5f5f5] p-5 pb-0 sm:p-8">
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
              <h3 className="mb-1.5 text-[17px] font-bold text-gray-900">
                Create a beautiful profile
              </h3>
              <p className="text-[15px] leading-snug text-gray-500">
                A fun and intuitive{' '}
                <Link
                  href="/claim"
                  className="cursor-text text-inherit no-underline hover:text-inherit"
                >
                  editor
                </Link>{' '}
                allows you to create a beautiful profile in just a couple
                minutes.
              </p>
            </div>

            {/* Mock UI */}
            <div className="relative -mx-4 flex h-[200px] flex-col justify-start overflow-hidden px-4">
              <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-transparent to-[#f5f5f5]"></div>

              <div className="mb-4 px-4 text-[24px] font-medium tracking-tight text-gray-300">
                Side Projects
              </div>

              <div className="animate-drag relative z-10 mx-auto flex w-full max-w-[400px] items-center justify-between rounded-[18px] border bg-white p-3 shadow-xl sm:p-4">
                <span className="truncate pr-2 text-[16px] font-medium tracking-tight text-gray-900 sm:text-[20px]">
                  Work Experience
                </span>
                <div className="relative flex flex-col gap-[3px] opacity-40">
                  <div className="h-[2px] w-5 rounded-full bg-black"></div>
                  <div className="h-[2px] w-5 rounded-full bg-black"></div>

                  {/* Grabbing Hand SVG */}
                  <div className="absolute -bottom-6 -right-2 h-8 w-8 opacity-100">
                    <svg
                      viewBox="0 0 24 24"
                      fill="white"
                      stroke="black"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 9V3a2 2 0 0 1 4 0v6" />
                      <path d="M16 10V6a2 2 0 0 1 4 0v9a6 6 0 0 1-12 0V5a2 2 0 0 1 4 0v5" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-4 px-4 text-[24px] font-medium tracking-tight text-gray-300">
                Features
              </div>
              <div className="mt-6 px-4 text-[24px] font-medium tracking-tight text-gray-300">
                Features
              </div>
            </div>
          </div>

          {/* Feature 2: Clean Design */}
          <div className="flex flex-col overflow-hidden rounded-[24px] bg-[#f5f5f5] p-5 pb-0 sm:p-8">
            <div className="mb-8">
              <h3 className="mb-1.5 text-[17px] font-bold">Clean & Minimal</h3>
              <p className="text-[15px] leading-snug text-gray-500">
                Profiles are designed to be distraction-free, with optimized
                typography and only the relevant{' '}
                <Link
                  href="/faq"
                  className="cursor-text text-inherit no-underline hover:text-inherit"
                >
                  information
                </Link>{' '}
                shown.
              </p>
            </div>

            <div className="h-[180px] rounded-t-[16px] border border-b-0 border-gray-200 bg-white p-4 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] sm:p-6">
              <div className="flex gap-3 sm:gap-4">
                <div className="w-1/3 space-y-2">
                  <div className="h-2 w-16 rounded bg-gray-300"></div>
                  <div className="h-2 w-12 rounded bg-gray-200"></div>
                </div>
                <div className="w-2/3 space-y-3">
                  <div className="h-3 w-32 rounded bg-gray-800"></div>
                  <div className="h-2 w-24 rounded bg-gray-400"></div>
                  <div className="space-y-1.5 pt-2">
                    <div className="h-1.5 w-full rounded bg-gray-200"></div>
                    <div className="h-1.5 w-5/6 rounded bg-gray-200"></div>
                    <div className="h-1.5 w-4/6 rounded bg-gray-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Find who you're looking for */}
          <div className="relative flex flex-col overflow-hidden rounded-[24px] bg-[#f5f5f5] p-5 pb-0 sm:p-8">
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
              <h3 className="mb-1.5 text-[17px] font-bold text-gray-900">
                Find who you&apos;re looking for
              </h3>
              <p className="text-[15px] leading-snug text-gray-500">
                Search by title, location, and username.
              </p>
            </div>

            <div className="h-[180px] w-full">
              <div className="mb-6 flex max-w-[95%] items-center rounded-full border bg-white px-3 py-2 shadow-sm sm:px-5 sm:py-3">
                <span className="flex items-center text-[15px] font-medium tracking-tight text-gray-900 sm:text-[18px]">
                  Art director
                  <span className="animate-blink ml-0.5 inline-block h-[1.1em] w-[2px] bg-blue-500"></span>
                </span>
              </div>

              <div className="space-y-4 px-1 sm:px-2">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="size-10 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:size-12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lauren"
                      alt="Lauren"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[14px] text-gray-400 sm:text-[16px]">
                      Lauren Jochum
                    </div>
                    <div className="text-[13px] text-gray-400 sm:text-[15px]">
                      <strong className="text-gray-400">Art director</strong> in
                      Berkeley
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-30 sm:gap-4">
                  <div className="size-10 shrink-0 overflow-hidden rounded-full bg-gray-200 sm:size-12">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Skip"
                      alt="Skip"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[14px] text-gray-400 sm:text-[16px]">
                      Skip Hursh
                    </div>
                    <div className="text-[13px] text-gray-400 sm:text-[15px]">
                      <strong className="text-gray-400">Art director</strong> in
                      NYC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Use it anywhere */}
          <div className="flex flex-col overflow-hidden rounded-[24px] bg-[#f5f5f5] p-5 pb-0 sm:p-8">
            <div className="mb-6 sm:mb-8">
              <h3 className="mb-1.5 text-[17px] font-bold text-gray-900">
                Use it anywhere
              </h3>
              <p className="text-[15px] leading-snug text-gray-500">
                Add your link wherever your audience is.
              </p>
            </div>

            <div className="h-auto rounded-t-[16px] border border-b-0 border-gray-200 bg-white p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] sm:h-[220px] sm:p-8">
              <div className="mb-4 flex items-center gap-4 sm:gap-8">
                <div className="size-[64px] shrink-0 rounded-full bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] to-[#d62976] p-[2px] sm:size-[84px] sm:p-[3px]">
                  <div className="h-full w-full rounded-full bg-white p-0.5">
                    <div className="h-full w-full overflow-hidden rounded-full bg-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tom"
                        alt="Tom Chung"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-around gap-3 pr-0 text-center sm:justify-center sm:gap-6 sm:pr-4">
                  <div className="flex flex-col items-center">
                    <div className="text-[17px] font-semibold text-gray-900 sm:text-[19px]">
                      54
                    </div>
                    <div className="text-[13px] tracking-tight text-gray-900 sm:text-[14px]">
                      Posts
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-[17px] font-semibold text-gray-900 sm:text-[19px]">
                      368
                    </div>
                    <div className="text-[13px] tracking-tight text-gray-900 sm:text-[14px]">
                      Followers
                    </div>
                  </div>
                  <div className="hidden flex-col items-center sm:flex">
                    <div className="text-[17px] font-semibold text-gray-900 sm:text-[19px]">
                      115
                    </div>
                    <div className="text-[13px] tracking-tight text-gray-900 sm:text-[14px]">
                      Following
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-1 flex flex-col pb-4 leading-snug sm:pb-0">
                <span className="text-[15px] font-semibold text-gray-900 sm:text-[16px]">
                  Tom Chung
                </span>
                <span className="text-[14px] text-gray-500 sm:text-[15px]">
                  Architectural Designer
                </span>
                <span className="text-[14px] text-[#00376b] sm:text-[15px]">
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
