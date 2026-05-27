import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { TopMenu } from '../components/TopMenu';
import { Footer } from '../components/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <main className="flex-1 flex flex-col font-sans text-gray-900 items-center">
        <div className="w-full max-w-[500px] px-6 pt-24 pb-32 flex flex-col gap-6">
          {/* Hero Section */}
          <div className="flex flex-col mb-8">
            <h1 className="text-[20px] md:text-[24px] font-normal tracking-tight leading-[1.3] text-gray-900 mb-8">
              <strong>Portfoliofy</strong> is a progressive platform used by
              thousands of people to create more mindful professional profiles.
            </h1>

            <div className="flex justify-end">
              <Link href="/claim">
                <Button className="bg-[#111] text-white hover:bg-black rounded-full h-12 px-8 text-[16px] font-medium tracking-wide">
                  Create a profile
                </Button>
              </Link>
            </div>
          </div>

          {/* Feature 1: Create a beautiful profile */}
          <div className="bg-[#f5f5f5] rounded-[24px] p-8 pb-0 overflow-hidden flex flex-col relative">
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
              <h3 className="font-bold text-[17px] mb-1.5 text-gray-900">
                Create a beautiful profile
              </h3>
              <p className="text-[15px] text-gray-500 leading-snug">
                A fun and intuitive editor allows you to create a beautiful
                profile in just a couple minutes.
              </p>
            </div>

            {/* Mock UI */}
            <div className="relative h-[200px] flex flex-col justify-start px-4 overflow-hidden -mx-4">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#f5f5f5] pointer-events-none z-20"></div>

              <div className="text-[24px] text-gray-300 font-medium px-4 mb-4 tracking-tight">
                Side Projects
              </div>

              <div className="bg-white border shadow-xl rounded-[18px] p-4 flex items-center justify-between relative z-10 animate-drag w-full mx-auto max-w-[400px]">
                <span className="font-medium text-[20px] text-gray-900 tracking-tight">
                  Work Experience
                </span>
                <div className="flex flex-col gap-[3px] opacity-40 relative">
                  <div className="w-5 h-[2px] bg-black rounded-full"></div>
                  <div className="w-5 h-[2px] bg-black rounded-full"></div>

                  {/* Grabbing Hand SVG */}
                  <div className="absolute -right-2 -bottom-6 w-8 h-8 opacity-100">
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

              <div className="text-[24px] text-gray-300 font-medium px-4 mt-4 tracking-tight">
                Features
              </div>
              <div className="text-[24px] text-gray-300 font-medium px-4 mt-6 tracking-tight">
                Writing
              </div>
            </div>
          </div>

          {/* Feature 2: Clean Design */}
          <div className="bg-[#f5f5f5] rounded-[24px] p-8 pb-0 overflow-hidden flex flex-col">
            <div className="mb-8">
              <h3 className="font-bold text-[17px] mb-1.5">Clean & Minimal</h3>
              <p className="text-[15px] text-gray-500 leading-snug">
                Profiles are designed to be distraction-free, with optimized
                typography and only the relevant information shown.
              </p>
            </div>

            <div className="bg-white rounded-t-[16px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 border-b-0 p-6 h-[180px]">
              <div className="flex gap-4">
                <div className="w-1/3 space-y-2">
                  <div className="h-2 w-16 bg-gray-300 rounded"></div>
                  <div className="h-2 w-12 bg-gray-200 rounded"></div>
                </div>
                <div className="w-2/3 space-y-3">
                  <div className="h-3 w-32 bg-gray-800 rounded"></div>
                  <div className="h-2 w-24 bg-gray-400 rounded"></div>
                  <div className="space-y-1.5 pt-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded"></div>
                    <div className="h-1.5 w-5/6 bg-gray-200 rounded"></div>
                    <div className="h-1.5 w-4/6 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3: Find who you're looking for */}
          <div className="bg-[#f5f5f5] rounded-[24px] p-8 pb-0 overflow-hidden flex flex-col relative">
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
              <h3 className="font-bold text-[17px] mb-1.5 text-gray-900">
                Find who you're looking for
              </h3>
              <p className="text-[15px] text-gray-500 leading-snug">
                Search by title, location, and username.
              </p>
            </div>

            <div className="bg-white rounded-t-[16px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 border-b-0 p-4 h-[180px]">
              <div className="bg-white border shadow-sm rounded-full px-5 py-3 flex items-center mb-6 max-w-[95%]">
                <span className="text-gray-900 font-medium text-[18px] tracking-tight flex items-center">
                  Art director
                  <span className="inline-block w-[2px] h-[1.1em] bg-blue-500 ml-0.5 animate-blink"></span>
                </span>
              </div>

              <div className="space-y-4 px-2">
                <div className="flex gap-4 items-center">
                  <div className="size-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Lauren"
                      alt="Lauren"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[16px] text-gray-400">
                      Lauren Jochum
                    </div>
                    <div className="text-[15px] text-gray-400">
                      <strong className="text-gray-400">Art director</strong> in
                      Berkeley
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-center opacity-30">
                  <div className="size-12 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=Skip"
                      alt="Skip"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[16px] text-gray-400">Skip Hursh</div>
                    <div className="text-[15px] text-gray-400">
                      <strong className="text-gray-400">Art director</strong> in
                      NYC
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 4: Use it anywhere */}
          <div className="bg-[#f5f5f5] rounded-[24px] p-5 sm:p-8 pb-0 overflow-hidden flex flex-col">
            <div className="mb-6 sm:mb-8">
              <h3 className="font-bold text-[17px] mb-1.5 text-gray-900">
                Use it anywhere
              </h3>
              <p className="text-[15px] text-gray-500 leading-snug">
                Add your link wherever your audience is.
              </p>
            </div>

            <div className="bg-white rounded-t-[16px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] border border-gray-200 border-b-0 p-5 sm:p-8 h-auto sm:h-[220px]">
              <div className="flex items-center gap-4 sm:gap-8 mb-4">
                <div className="size-[64px] sm:size-[84px] rounded-full p-[2px] sm:p-[3px] bg-gradient-to-tr from-[#feda75] via-[#fa7e1e] to-[#d62976] shrink-0">
                  <div className="w-full h-full bg-white rounded-full p-0.5">
                    <div className="w-full h-full bg-gray-200 rounded-full overflow-hidden">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Tom"
                        alt="Tom Chung"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 sm:gap-6 text-center w-full justify-around sm:justify-center pr-0 sm:pr-4">
                  <div className="flex flex-col items-center">
                    <div className="font-semibold text-[17px] sm:text-[19px] text-gray-900">
                      54
                    </div>
                    <div className="text-[13px] sm:text-[14px] text-gray-900 tracking-tight">
                      Posts
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="font-semibold text-[17px] sm:text-[19px] text-gray-900">
                      368
                    </div>
                    <div className="text-[13px] sm:text-[14px] text-gray-900 tracking-tight">
                      Followers
                    </div>
                  </div>
                  <div className="hidden sm:flex flex-col items-center">
                    <div className="font-semibold text-[17px] sm:text-[19px] text-gray-900">
                      115
                    </div>
                    <div className="text-[13px] sm:text-[14px] text-gray-900 tracking-tight">
                      Following
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col leading-snug ml-1 pb-4 sm:pb-0">
                <span className="font-semibold text-[15px] sm:text-[16px] text-gray-900">
                  Tom Chung
                </span>
                <span className="text-[14px] sm:text-[15px] text-gray-500">
                  Architectural Designer
                </span>
                <span className="text-[14px] sm:text-[15px] text-[#00376b]">
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
