import { TopMenu } from '@/components/TopMenu';
import { Footer } from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <TopMenu />
      
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-20 font-mono">
        <h1 className="text-4xl font-bold text-gray-900 mb-12 tracking-tight">Privacy Policy</h1>
        
        <div className="space-y-8 text-gray-700 leading-relaxed text-sm md:text-base">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Data Collection</h2>
            <p>
              We collect information you provide directly to us when you create an account, build your profile, or communicate with us. This includes your name, email address, and the professional data you choose to host on your public profile.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Data Usage</h2>
            <p>
              The information we collect is used solely to provide, maintain, and improve our services, and to communicate with you. We do not sell your personal data to third parties.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Data Storage & Security</h2>
            <p>
              We use industry-standard security measures to protect your data. Your profile information is stored securely using cloud-based caching and database solutions (e.g., Upstash Redis).
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Your Rights</h2>
            <p>
              You have the right to access, update, or delete your personal information at any time through your account settings. Once an account is deleted, your data is permanently removed from our active systems.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
