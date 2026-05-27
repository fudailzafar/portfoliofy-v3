import { TopMenu } from '@/components/TopMenu';
import { Footer } from '@/components/Footer';

export default function FAQPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopMenu />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-20 font-mono">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">Frequently Asked Questions</h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg">Is Portfoliofy really free?</h3>
            <p className="text-gray-600">Yes. Portfoliofy is 100% free and open source. We believe everyone deserves a clean, professional space on the internet.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg">Can I use a custom domain?</h3>
            <p className="text-gray-600">Currently, you can claim a custom username on our domain (e.g., portfoliofy.com/username). Full custom domain support is on our roadmap.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg">How is my data stored?</h3>
            <p className="text-gray-600">Your data is stored securely using Upstash Redis. It is incredibly fast and highly reliable, ensuring your portfolio loads instantly anywhere in the world.</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg">Can I hide certain sections of my resume?</h3>
            <p className="text-gray-600">Yes! The editor gives you complete modular control. You can toggle visibility for any section and reorder them using our drag-and-drop interface.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
