import { TopMenu } from '@/components/TopMenu';
import { Footer } from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopMenu />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-20 font-mono">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">The Story Behind Portfoliofy</h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">The Problem</h2>
            <p>
              Not too long ago, I found myself frustrated with the state of professional networking and portfolio platforms. The spaces meant to showcase our hard work had become bloated, ad-heavy, and full of algorithmic noise. I wanted to share a link that simply said "here is what I can do," but every platform forced visitors to log in, scroll past feed updates, or deal with rigid, uninspired templates.
            </p>
            <p>
              I realized that developers, designers, and creators needed a quiet, elegant space on the internet. A place where the work speaks for itself, without the surrounding distractions.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">The Solution</h2>
            <p>
              That frustration birthed Portfoliofy. I decided to build a tool that strips away everything unnecessary and focuses entirely on typographic hierarchy, clean whitespace, and modular control. 
            </p>
            <p>
              Portfoliofy allows you to turn your professional history into a stunning, minimalist website in a single click. No ads. No infinite scrolling feeds. Just a beautiful, Swiss-design inspired layout that you control completely.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">How It Was Built</h2>
            <p>
              To ensure the platform was as fast and reliable as it looks, I engineered Portfoliofy using a modern, edge-ready tech stack. 
            </p>
            <ul className="list-disc pl-5 space-y-2 text-gray-600">
              <li><strong className="text-gray-900">Next.js 15:</strong> Providing lightning-fast server-side rendering and highly optimized React server components.</li>
              <li><strong className="text-gray-900">Tailwind CSS:</strong> Crafting the strict design system, ensuring pixel-perfect spacing and monochromatic harmony.</li>
              <li><strong className="text-gray-900">Upstash Redis:</strong> Powering instantaneous data persistence, making sure your layout updates are saved in milliseconds.</li>
              <li><strong className="text-gray-900">Clerk:</strong> Managing seamless, secure authentication.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">The Future</h2>
            <p>
              We are just getting started. The vision for Portfoliofy is to become the default standard for professional representation online. As we grow, we are actively looking to expand the core team with individuals who share a passion for uncompromising, minimalist design and robust software architecture. 
            </p>
            <p>
              Whether we're introducing new modular blocks, deeper integrations, or team workspaces, the core philosophy will remain the same: keep it clean, keep it fast, and keep it focused on you.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
