import { TopMenu } from '@/components/TopMenu';
import { Footer } from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopMenu />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-20 font-mono">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">Terms and Conditions</h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Portfoliofy, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">2. User Accounts</h2>
            <p>
              You are responsible for maintaining the security of your account and password. Portfoliofy cannot and will not be liable for any loss or damage from your failure to comply with this security obligation.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">3. Acceptable Use</h2>
            <p>
              You must not use Portfoliofy to host or transmit any unlawful, offensive, or otherwise objectionable content. We reserve the right to remove any profile that violates these terms.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">4. Modifications</h2>
            <p>
              We reserve the right to modify or discontinue, temporarily or permanently, the service with or without notice.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
