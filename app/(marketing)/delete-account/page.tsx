import { Footer } from '@/components/layout/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delete your account',
  description: 'How to delete your Portfoliofy account and data.',
};

export default function DeleteAccountPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff] dark:bg-[#222]">
      <main className="mx-auto w-full max-w-[540px] flex-1 px-6 py-[72px] font-sans sm:px-0">
        <h1 className="mb-4 text-[20px] font-medium text-[#111] dark:text-[#eee]">
          Delete your account
        </h1>

        <div className="space-y-4 text-[14px] font-normal leading-relaxed text-[#666] dark:text-[#aaa]">
          <p>
            You can delete your Portfoliofy account at any time, from the
            website or the Android app.
          </p>

          <ol className="list-decimal space-y-2 pl-5">
            <li>Sign in and open your profile.</li>
            <li>Click Edit profile, then Settings.</li>
            <li>Click Delete, type your username, and confirm.</li>
          </ol>

          <p>
            Deleting your account immediately and permanently removes your
            account, your profile, and all your pages and posts. If you
            connected a custom domain, it is disconnected. This cannot be
            undone.
          </p>

          <p>
            Images you uploaded stop appearing anywhere once your account is
            deleted. To have the files themselves erased from our storage too,
            email us after deleting your account.
          </p>

          <p>
            If you can&apos;t sign in, email{' '}
            <a
              href="mailto:fudail.zafar@gmail.com"
              className="text-[#111] underline underline-offset-[3px] dark:text-[#eee]"
            >
              fudail.zafar@gmail.com
            </a>{' '}
            from the address on your account with the subject &quot;Delete my
            account&quot;. We&apos;ll delete it and confirm within 7 days.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
