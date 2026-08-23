import { HomeHero } from '@/components/layout/HomeHero';
import { Footer } from '@/components/layout/Footer';
import Link from 'next/link';
import { auth } from '@/auth';
import { getUsernameById } from '@/lib/server/dbActions';
import { ClaimDialog } from '@/components/auth/ClaimDialog';
import { MousePointer2 } from 'lucide-react';

const ResumePaper = ({ className }: { className?: string }) => (
  <div
    className={`flex w-[90%] flex-col gap-6 border border-border-strong bg-[#fff] p-5 text-[9px] shadow-sm dark:bg-[#222] sm:w-[95%] sm:p-7 sm:text-[10px] ${
      className || ''
    }`}
  >
    <div className="flex gap-4 sm:gap-8">
      <div className="w-[35%] shrink-0">
        <div className="font-regular mb-0.5 text-[10px] text-[#111] dark:text-[#eee] sm:text-[12px]">
          Jeff Hamada
        </div>
        <div className="text-content-muted">Artist in Vancouver, He/Him</div>
      </div>
      <div className="w-full">
        <div className="font-regular mb-4 text-[10px] text-[#111] dark:text-[#eee] sm:text-[12px]">
          Work Experience
        </div>

        <div className="mb-5 flex gap-3 sm:gap-5">
          <div className="w-16 shrink-0 whitespace-nowrap font-medium text-content-muted">
            2008 — Now
          </div>
          <div className="flex-1">
            <div className="font-regular mb-0.5 text-[10px] text-[#111] dark:text-[#eee] sm:text-[12px]">
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
            <div className="font-regular mb-0.5 text-[10px] text-[#111] dark:text-[#eee] sm:text-[12px]">
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
    <div className="flex min-h-screen flex-col bg-[#fff] dark:bg-[#222]">
      {needsClaim && <ClaimDialog />}
      <main className="flex flex-1 flex-col items-center font-sans text-[#111] dark:text-[#eee]">
        <div className="flex w-full max-w-[540px] flex-col px-6 pb-32 pt-4 sm:pt-[72px] md:px-0">
          {/* Hero Section */}
          <HomeHero />
          {/* Feature 1: Create a beautiful profile */}
          <div className="relative mb-8 flex h-[384px] flex-col overflow-hidden rounded-[22px] bg-[rgba(0,0,0,0.05)] p-5 pb-0 dark:bg-[rgb(255,255,255,0.05)] sm:h-[384px] sm:rounded-[36px] sm:p-9 sm:pb-0 sm:pt-8">
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
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-[#111] dark:text-[#eee]">
                Create a beautiful profile
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-[#666] dark:text-[#aaa]">
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

              <div className="mb-4 px-4 text-[16px] tracking-tight text-[#aaa] opacity-70 dark:text-content-muted sm:text-[28px]">
                Side Projects
              </div>

              <div className="animate-drag relative z-10 mx-auto flex w-full max-w-[460px] items-center justify-between rounded-[18px] bg-[#fff] p-3 text-[#111] shadow-xl dark:bg-[#222] dark:text-[#eee] dark:shadow-none sm:rounded-[22px] sm:p-4 sm:px-5">
                <span className="truncate pr-2 text-[16px] tracking-tight text-[#111] dark:text-[#eee] sm:text-[28px]">
                  Work Experience
                </span>
                <div className="relative flex flex-col gap-[3px]">
                  <div className="flex flex-col gap-[3px] opacity-40 dark:opacity-60">
                    <div className="h-[2px] w-5 rounded-full bg-content-muted"></div>
                    <div className="h-[2px] w-5 rounded-full bg-content-muted"></div>
                  </div>

                  {/* Grabbing Hand SVG */}
                  <div className="absolute -bottom-6 -right-2 h-8 w-8 opacity-100">
                    <svg
                      viewBox="416 35 28 26"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-full w-full opacity-100 drop-shadow-md"
                    >
                      <g filter="url(#filter0_d)">
                        <path
                          d="M422 38.3C422.96 37.94 424.86 38.16 425.36 39.24C425.86 40.32 426.16 41.72 426.18 41.38C426.142 40.3466 426.229 39.3124 426.44 38.3C426.662 37.6517 427.172 37.1423 427.82 36.92C428.415 36.732 429.046 36.6908 429.66 36.8C430.281 36.9278 430.831 37.2849 431.2 37.8C431.668 38.9663 431.932 40.2043 431.98 41.46C432.03 40.3885 432.211 39.3272 432.52 38.3C432.854 37.8291 433.342 37.4896 433.9 37.34C434.561 37.2191 435.239 37.2191 435.9 37.34C436.443 37.5201 436.917 37.8621 437.26 38.32C437.685 39.3803 437.941 40.5005 438.02 41.64C438.02 41.92 438.16 40.86 438.6 40.16C438.954 39.1107 440.091 38.5466 441.14 38.9C442.189 39.2535 442.754 40.3907 442.4 41.44C442.4 42.74 442.4 42.68 442.4 43.56C442.4 44.44 442.4 45.22 442.4 45.96C442.328 47.1305 442.168 48.2938 441.92 49.44C441.573 50.4547 441.088 51.4169 440.48 52.3C439.509 53.3801 438.707 54.6005 438.1 55.92C437.952 56.576 437.885 57.2477 437.9 57.92C437.898 58.5413 437.979 59.1601 438.14 59.76C437.322 59.8474 436.498 59.8474 435.68 59.76C434.9 59.64 433.94 58.08 433.68 57.6C433.551 57.3423 433.288 57.1794 433 57.1794C432.712 57.1794 432.449 57.3423 432.32 57.6C431.88 58.36 430.9 59.74 430.32 59.82C428.98 59.98 426.2 59.82 424.04 59.82C424.04 59.82 424.42 57.82 423.58 57.1C422.74 56.38 421.92 55.54 421.3 54.98L419.64 53.14C418.469 52.0534 417.613 50.6717 417.16 49.14C416.74 47.26 416.78 46.36 417.16 45.6C417.548 44.9724 418.153 44.5096 418.86 44.3C419.448 44.1934 420.052 44.2347 420.62 44.42C421.013 44.5844 421.352 44.8544 421.6 45.2C422.06 45.82 422.22 46.12 422.02 45.44C421.82 44.76 421.38 44.26 421.16 43.44C420.732 42.4716 420.475 41.4363 420.4 40.38C420.482 39.4324 421.144 38.6351 422.06 38.38"
                          fill="white"
                        ></path>
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M428.055 37.6322C427.643 37.7762 427.317 38.0955 427.164 38.5029C426.973 39.4399 426.894 40.3964 426.93 41.3522C426.93 41.3761 426.93 41.4001 426.929 41.424C426.929 41.4249 426.929 41.426 426.929 41.4272C426.927 41.4568 426.92 41.5816 426.865 41.7136C426.841 41.7701 426.742 41.997 426.471 42.117C426.134 42.2666 425.846 42.1267 425.726 42.0421C425.616 41.9644 425.554 41.8758 425.533 41.8448C425.504 41.8031 425.484 41.7655 425.471 41.7415C425.447 41.693 425.427 41.6454 425.414 41.6112C425.37 41.498 425.315 41.3219 425.258 41.1424C425.251 41.1178 425.243 41.0932 425.235 41.0687C425.094 40.6232 424.907 40.0461 424.679 39.5551C424.574 39.3283 424.256 39.087 423.691 38.9624C423.143 38.8415 422.58 38.8835 422.263 39.0022C422.25 39.0072 422.237 39.0118 422.223 39.016C421.619 39.2042 421.194 39.7441 421.152 40.3728C421.224 41.3267 421.459 42.2614 421.846 43.1366C421.862 43.1719 421.874 43.2083 421.884 43.2456C421.972 43.5712 422.104 43.8398 422.263 44.1464C422.276 44.171 422.289 44.1961 422.302 44.2217C422.448 44.5001 422.625 44.8394 422.74 45.2283C422.785 45.3813 422.835 45.56 422.85 45.6999C422.853 45.7379 422.86 45.8202 422.846 45.9182C422.837 45.9787 422.791 46.2801 422.489 46.4654C422.151 46.6731 421.832 46.5388 421.749 46.4973C421.644 46.4459 421.574 46.3817 421.546 46.3564C421.45 46.2663 421.35 46.1299 421.29 46.0473C421.287 46.0439 421.285 46.0406 421.282 46.0374C421.252 45.9957 421.221 45.9534 421.189 45.9092C421.132 45.8305 421.071 45.7456 420.998 45.6468L420.991 45.6375C420.829 45.4124 420.61 45.2349 420.357 45.1233C419.93 44.9889 419.477 44.9573 419.035 45.0308C418.532 45.1898 418.1 45.5207 417.816 45.9655C417.571 46.4754 417.488 47.159 417.886 48.9513C418.303 50.3444 419.084 51.6009 420.15 52.5903C420.167 52.6053 420.182 52.6211 420.197 52.6376L421.832 54.4495C422.074 54.6697 422.346 54.93 422.626 55.1991C422.709 55.2781 422.792 55.3578 422.876 55.4375C423.261 55.8059 423.664 56.1843 424.068 56.5305C424.429 56.8401 424.622 57.2527 424.727 57.6227C424.834 57.9964 424.869 58.3846 424.875 58.7173C424.877 58.8421 424.875 58.9627 424.87 59.0764C425.366 59.0834 425.879 59.095 426.384 59.1065C426.764 59.1152 427.14 59.1237 427.501 59.1301C428.614 59.1497 429.571 59.1482 430.184 59.0807C430.2 59.0713 430.249 59.0433 430.331 58.9736C430.465 58.8607 430.623 58.6938 430.795 58.4867C431.131 58.0805 431.458 57.5899 431.662 57.2404C431.922 56.7426 432.437 56.4294 433 56.4294C433.567 56.4294 434.086 56.7472 434.344 57.2514C434.463 57.4685 434.741 57.9321 435.072 58.348C435.24 58.559 435.406 58.7381 435.557 58.8643C435.696 58.9814 435.774 59.0116 435.791 59.0175C436.27 59.0673 436.752 59.085 437.233 59.0707C437.177 58.6925 437.149 58.3103 437.15 57.9273C437.134 57.197 437.208 56.4675 437.368 55.7549C437.38 55.7038 437.397 55.6541 437.419 55.6066C438.05 54.2337 438.883 52.9628 439.889 51.8357C440.438 51.0317 440.877 50.1582 441.196 49.2384C441.429 48.1506 441.581 47.047 441.65 45.9367V41.44C441.65 41.3586 441.663 41.2777 441.689 41.2005C441.911 40.5438 441.557 39.832 440.901 39.6107C440.244 39.3895 439.532 39.7426 439.311 40.3994C439.292 40.4554 439.267 40.509 439.235 40.5591C439.075 40.814 438.953 41.1677 438.867 41.472C438.846 41.5444 438.828 41.6107 438.813 41.6696C438.81 41.6802 438.807 41.6911 438.805 41.7021C438.793 41.7469 438.781 41.7933 438.771 41.8288C438.765 41.8498 438.755 41.8843 438.742 41.9196C438.736 41.936 438.724 41.97 438.704 42.0096C438.702 42.0157 438.635 42.1658 438.48 42.2831C438.382 42.3574 438.159 42.4837 437.863 42.4182C437.585 42.3565 437.441 42.1666 437.39 42.0859C437.301 41.9453 437.283 41.8073 437.28 41.7913C437.28 41.7907 437.28 41.7915 437.28 41.7913C437.273 41.7446 437.271 41.6994 437.27 41.6703C437.198 40.651 436.972 39.6484 436.602 38.6963C436.368 38.4106 436.06 38.1934 435.711 38.0682C435.167 37.9751 434.611 37.9763 434.067 38.0721C433.726 38.1696 433.424 38.3693 433.201 38.6432C432.932 39.5718 432.774 40.5289 432.729 41.4947C432.711 41.8962 432.379 42.2116 431.977 42.21C431.575 42.2084 431.246 41.8903 431.231 41.4888C431.187 40.3514 430.953 39.2295 430.54 38.1696C430.284 37.8465 429.923 37.6222 429.518 37.5366C429.03 37.4514 428.528 37.4842 428.055 37.6322ZM423.303 59.6798L423.305 59.6688L423.314 59.617C423.321 59.57 423.331 59.4995 423.341 59.4118C423.361 59.2348 423.379 58.9962 423.375 58.7427C423.371 58.4853 423.343 58.2385 423.285 58.0348C423.226 57.8272 423.151 57.7198 423.092 57.6694C422.656 57.2956 422.229 56.894 421.84 56.5224C421.75 56.4365 421.662 56.3527 421.577 56.2713C421.289 55.9947 421.029 55.7457 420.797 55.5365C420.778 55.5194 420.76 55.5013 420.743 55.4824L419.105 53.6665C417.848 52.4919 416.929 51.0025 416.441 49.3526C416.436 49.3364 416.432 49.32 416.428 49.3035C416.001 47.3904 415.987 46.2688 416.489 45.2646C416.499 45.2445 416.51 45.2249 416.522 45.2059C417.006 44.4214 417.763 43.8429 418.647 43.5809C418.673 43.5732 418.699 43.5669 418.726 43.562C419.284 43.4608 419.855 43.4699 420.407 43.5871C419.984 42.5846 419.729 41.5189 419.652 40.4328C419.65 40.4046 419.65 40.3763 419.651 40.3481C419.705 39.0773 420.547 37.9763 421.757 37.5902C422.398 37.3558 423.255 37.3302 424.014 37.4976C424.576 37.6216 425.213 37.8823 425.662 38.3646C425.676 38.292 425.691 38.2194 425.706 38.147C425.712 38.1164 425.72 38.0863 425.731 38.0567C426.028 37.1893 426.709 36.5079 427.577 36.2105L427.594 36.2047C428.304 35.9801 429.058 35.9311 429.791 36.0616L429.811 36.0651C430.617 36.2309 431.33 36.6945 431.81 37.363C431.845 37.4119 431.874 37.4649 431.896 37.5207C431.928 37.5995 431.959 37.6787 431.988 37.7581C432.42 37.2007 433.023 36.7988 433.706 36.6156C433.725 36.6103 433.745 36.6058 433.765 36.6022C434.516 36.465 435.285 36.465 436.035 36.6022C436.069 36.6085 436.103 36.6171 436.136 36.6281C436.824 36.8565 437.426 37.2901 437.861 37.8706C437.9 37.923 437.932 37.9803 437.956 38.041C438.096 38.391 438.219 38.747 438.325 39.1079C439.024 38.2093 440.24 37.8052 441.379 38.1892C442.779 38.6607 443.551 40.1474 443.15 41.5531V45.96C443.15 45.9753 443.15 45.9907 443.149 46.006C443.074 47.2142 442.909 48.4151 442.653 49.5983C442.647 49.6268 442.639 49.6551 442.63 49.6827C442.26 50.7622 441.745 51.7859 441.098 52.7254C441.079 52.752 441.059 52.7774 441.038 52.8013C440.135 53.8056 439.386 54.9378 438.815 56.1611C438.692 56.7332 438.637 57.3178 438.65 57.903L438.65 57.9224C438.649 58.4771 438.72 59.0296 438.864 59.5652C438.921 59.777 438.883 60.0031 438.759 60.184C438.635 60.3649 438.438 60.4824 438.22 60.5057C437.349 60.5987 436.471 60.5987 435.6 60.5057C435.593 60.5049 435.585 60.504 435.577 60.5029C435.574 60.5024 435.57 60.5018 435.566 60.5012C435.171 60.4404 434.837 60.2182 434.594 60.0143C434.337 59.7994 434.1 59.536 433.898 59.2819C433.494 58.7734 433.165 58.224 433.021 57.9572L433.009 57.9351C433.007 57.9317 433.004 57.9294 433 57.9294C432.996 57.9294 432.993 57.9315 432.991 57.9349C432.984 57.9487 432.977 57.9624 432.969 57.9757C432.732 58.3853 432.354 58.9558 431.95 59.4432C431.749 59.6861 431.527 59.9267 431.3 60.1189C431.097 60.2901 430.789 60.5123 430.423 60.5629L430.409 60.5648C429.679 60.6519 428.597 60.6497 427.474 60.6298C427.096 60.6232 426.711 60.6144 426.326 60.6056C425.542 60.5878 424.759 60.57 424.04 60.57C423.817 60.57 423.605 60.4703 423.462 60.2982C423.32 60.1265 423.262 59.8989 423.303 59.6798Z"
                          className="fill-[#111]"
                        ></path>
                        <path
                          d="M437.5 53.6518V46.7482C437.5 46.335 437.164 46 436.75 46C436.336 46 436 46.335 436 46.7482V53.6518C436 54.065 436.336 54.4 436.75 54.4C437.164 54.4 437.5 54.065 437.5 53.6518Z"
                          className="fill-[#111]"
                        ></path>
                        <path
                          d="M433.54 53.6493L433.5 46.7421C433.498 46.3299 433.16 45.9976 432.746 46C432.331 46.0024 431.998 46.3385 432 46.7507L432.04 53.6579C432.042 54.0701 432.38 54.4024 432.794 54.4C433.209 54.3976 433.542 54.0615 433.54 53.6493Z"
                          className="fill-[#111]"
                        ></path>
                        <path
                          d="M428 46.7598L428.04 53.649C428.042 54.0662 428.38 54.4024 428.794 54.4C429.209 54.3975 429.542 54.0574 429.54 53.6402L429.5 46.751C429.498 46.3338 429.16 45.9976 428.746 46C428.331 46.0025 427.998 46.3426 428 46.7598Z"
                          className="fill-[#111]"
                        ></path>
                      </g>
                    </svg>
                  </div>
                </div>
              </div>

              <div className="mt-4 px-4 text-[16px] tracking-tight text-[#aaa] opacity-70 dark:text-content-muted sm:text-[28px]">
                Features
              </div>
              <div className="mt-6 px-4 text-[16px] tracking-tight text-[#aaa] opacity-70 dark:text-content-muted sm:text-[28px]">
                Writing
              </div>
            </div>
          </div>

          {/* Feature 2: Make it collaborative */}
          <div className="relative mb-8 flex h-[384px] flex-col overflow-hidden rounded-[22px] bg-[rgba(0,0,0,0.05)] p-5 pb-0 dark:bg-[rgb(255,255,255,0.05)] sm:h-[384px] sm:rounded-[36px] sm:p-9 sm:pb-0 sm:pt-8">
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
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-[#111] dark:text-[#eee]">
                Make it collaborative
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-[#666] dark:text-[#aaa]">
                Profiles are made even richer when you tag collaborators in
                experiences.
              </p>
            </div>

            <div className="relative flex w-full flex-1 items-center justify-center overflow-hidden">
              <div className="relative flex w-full max-w-[400px] flex-col justify-between gap-6 rounded-[18px] border border-border-strong p-4 text-[#111] shadow-xl dark:text-[#eee] dark:shadow-none sm:p-5">
                <div className="relative">
                  <div className="font-regular text-[16px] tracking-tight text-[#111] dark:text-[#eee] sm:text-[20px]">
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
          <div className="relative mb-8 flex h-[384px] flex-col overflow-hidden rounded-[22px] bg-[rgba(0,0,0,0.05)] p-5 pb-0 dark:bg-[rgb(255,255,255,0.05)] sm:h-[384px] sm:rounded-[36px] sm:p-9 sm:pb-0 sm:pt-8">
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
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-[#111] dark:text-[#eee]">
                Print it out
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-[#666] dark:text-[#aaa]">
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
          <div className="relative mb-8 flex h-[384px] flex-col overflow-hidden rounded-[22px] bg-[rgba(0,0,0,0.05)] p-5 pb-0 dark:bg-[rgb(255,255,255,0.05)] sm:h-[384px] sm:rounded-[36px] sm:p-9 sm:pb-0 sm:pt-8">
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
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-[#111] dark:text-[#eee]">
                Find who you&apos;re looking for
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-[#666] dark:text-[#aaa]">
                Search by title, location, and username.
              </p>
            </div>

            <div className="flex w-full flex-1 flex-col">
              <div className="mb-6 flex max-w-full items-center rounded-3xl bg-[#fff] px-3 py-2 text-[#111] shadow-sm dark:text-[#eee] dark:shadow-none sm:px-5 sm:py-3">
                <span className="font-regular flex items-center text-[15px] tracking-tight text-[#111] dark:text-[#eee] sm:text-[30px]">
                  Art director
                  <span className="animate-blink ml-0.5 inline-block h-[1.1em] w-[2px] bg-[#0085FF]"></span>
                </span>
              </div>

              <div className="space-y-4 px-1 sm:px-2">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="size-10 shrink-0 overflow-hidden rounded-full bg-surface-3 sm:size-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://api.dicebear.com/10.x/glyphs/svg?seed=Lauren"
                      alt="Lauren"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[14px] text-content-muted opacity-30 dark:text-content-muted sm:text-[28px]">
                      Lauren Jochum
                    </div>
                    <div className="text-[13px] text-content-muted opacity-30 dark:text-content-muted sm:text-[28px]">
                      <strong className="text-[#111] dark:text-[#eee]">
                        Art director
                      </strong>{' '}
                      in Berkeley
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 opacity-30 sm:gap-4">
                  <div className="size-10 shrink-0 overflow-hidden rounded-full bg-surface-3 sm:size-16">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="https://api.dicebear.com/10.x/glyphs/svg?seed=Skip"
                      alt="Skip"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="leading-tight">
                    <div className="text-[14px] text-content-muted dark:text-content-muted sm:text-[28px]">
                      Skip Hursh
                    </div>
                    <div className="text-[13px] text-content-muted dark:text-content-muted sm:text-[28px]">
                      <strong className="text-[#111] dark:text-[#eee]">
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
          <div className="relative flex h-[354px] flex-col overflow-hidden rounded-[22px] bg-[rgba(0,0,0,0.05)] p-5 pb-0 dark:bg-[rgb(255,255,255,0.05)] sm:h-[360px] sm:rounded-[36px] sm:p-9 sm:pb-0 sm:pt-8">
            <div className="mb-6 sm:mb-8">
              <h3 className="mb-1.5 text-[clamp(14px,-8px+5vw,18px)] font-medium text-[#111] dark:text-[#eee]">
                Use it anywhere
              </h3>
              <p className="text-[clamp(14px,-8px+5vw,18px)] leading-snug text-[#666] dark:text-[#aaa]">
                Add your link wherever your audience is.
              </p>
            </div>

            <div className="flex w-full flex-1 flex-col border border-b-0 border-border-strong bg-[#fff] p-5 text-[#111] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] dark:bg-[#222] dark:text-[#eee] dark:shadow-none sm:p-5">
              <div className="mb-4 flex items-center gap-4 sm:gap-8">
                <div className="size-[64px] shrink-0 rounded-full bg-gradient-to-b from-[#9E2692] to-[#FAA958] p-[2px] sm:size-[120px] sm:p-[3px]">
                  <div className="h-full w-full rounded-full p-0.5 text-[#111] dark:text-[#eee]">
                    <div className="h-full w-full overflow-hidden rounded-full bg-surface-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="https://api.dicebear.com/10.x/glyphs/svg?seed=Tom"
                        alt="Tom Chung"
                        className="h-full w-full rounded-full object-cover p-0.5"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex w-full justify-around gap-3 pr-0 text-center sm:justify-center sm:gap-8">
                  <div className="flex flex-col items-center">
                    <div className="text-[17px] font-medium text-[#111] dark:text-[#eee] sm:text-[20px]">
                      54
                    </div>
                    <div className="text-[13px] tracking-tight text-[#111] dark:text-[#eee] sm:text-[18px]">
                      Posts
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="text-[17px] font-medium text-[#111] dark:text-[#eee] sm:text-[20px]">
                      368
                    </div>
                    <div className="text-[13px] tracking-tight text-[#111] dark:text-[#eee] sm:text-[18px]">
                      Followers
                    </div>
                  </div>
                  <div className="hidden flex-col items-center sm:flex">
                    <div className="text-[17px] font-medium text-[#111] dark:text-[#eee] sm:text-[20px]">
                      115
                    </div>
                    <div className="text-[13px] tracking-tight text-[#111] dark:text-[#eee] sm:text-[18px]">
                      Following
                    </div>
                  </div>
                </div>
              </div>

              <div className="ml-1 flex flex-col pb-4 leading-snug sm:pb-0">
                <span className="text-[15px] font-medium text-[#111] dark:text-[#eee] sm:text-[18px]">
                  Tom Chung
                </span>
                <span className="text-[14px] text-[#8d8e8e] sm:text-[18px]">
                  Architectural Designer
                </span>
                <span className="text-[14px] text-[#00366a] sm:text-[18px]">
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
