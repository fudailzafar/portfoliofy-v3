import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-20 font-sans">
        <h1 className="mb-2 text-4xl font-bold tracking-tight text-gray-900">
          Privacy Policy
        </h1>
        <p className="mb-12 text-gray-500">Effective May 27, 2026</p>

        <div className="space-y-6 text-[15px] leading-relaxed text-gray-700">
          <p>
            We care about your privacy and only collect information we deem
            necessary to providing your requested service. Accordingly we have
            developed this privacy policy in order for you to understand how we
            collect and use personal information. We have outlined our privacy
            policy below.
          </p>

          <ul className="list-disc space-y-6 pl-5">
            <li>
              We collect basic information from you in order to set up your
              account. For example in order to sign up for an account you must
              provide an email address, username, and display name. You may
              provide us with more information for your public profile, but we
              don't require that information to create an account.
            </li>
            <li>
              If you have an account with us we collect the information that you
              provide for your public profile. For example, if you have an
              account, your username is part of that public profile, along with
              any other information you put into your public profile, like a
              photo or an "About me" description. Your public profile
              information is just that — public — so please keep that in mind
              when deciding what information you would like to include.
            </li>
            <li>
              Your email will not be shared as part of your public profile,
              unless you explicitly choose to share it. Your email may be used
              to send you notifications, however this can be turned off at any
              time in your account settings.
            </li>
            <li>
              We use session cookies to keep you logged into your account, as
              well as Google Analytics cookies. By using this service you agree
              to this website storing these cookies.
            </li>
            <li>
              We do not accept responsibility or liability for any externally
              linked sites and their respective privacy policies.
            </li>
            <li>
              Our services are not intended for — and we don’t direct them to —
              anyone under 13. We do not knowingly collect personal information
              from anyone under 13.
            </li>
          </ul>

          <p className="pt-2">
            By continuing to use our website and services you agree to our
            policy surrounding privacy and personal information.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
