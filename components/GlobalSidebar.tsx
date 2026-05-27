import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton, SignInButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';

export function GlobalSidebar() {
  const pathname = usePathname();
  
  return (
    <div className="flex flex-col h-full w-[260px] bg-[#fafafa] border-r border-gray-100 py-6 px-4">
      <div className="flex-1 mt-2">
        <div className="bg-[#f2f2f2] rounded-[10px] px-3 py-2 flex items-center justify-between cursor-pointer hover:bg-gray-200/80 transition-colors">
          <span className="text-[13px] text-gray-500 font-medium">Explore</span>
          <span className="text-[12px] text-gray-400 font-mono tracking-tighter">⌘⇧E</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 mt-auto pb-4">
        <Link href="/" className="flex items-center gap-3 w-fit group">
          <div className={`w-1 h-1 rounded-full ${pathname === '/' || pathname === '/about' ? 'bg-black' : 'bg-transparent'}`} />
          <span className="text-[14px] text-gray-800 font-medium group-hover:underline underline-offset-4">About</span>
        </Link>
        
        <SignedIn>
          <div className="py-2 flex items-center">
            <UserButton afterSignOutUrl="/" />
          </div>
        </SignedIn>
        
        <SignedOut>
          <SignInButton>
            <button className="flex items-center gap-3 w-fit group text-left">
              <div className="w-1 h-1 rounded-full bg-transparent" />
              <span className="text-[14px] text-gray-800 font-medium group-hover:underline underline-offset-4">Login</span>
            </button>
          </SignInButton>
          <div className="pt-3">
            <Link href="/claim">
              <Button variant="outline" className="w-full bg-white text-black border border-gray-200 hover:bg-gray-50 rounded-[10px] h-9 shadow-sm text-[13px] font-medium">
                Create a profile
              </Button>
            </Link>
          </div>
        </SignedOut>
      </div>
    </div>
  );
}
