import { Metadata } from 'next';
import Link from 'next/link';
import { Footer } from '@/components/layout/Footer';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Connect an AI app',
  description: 'Update your Portfoliofy profile by chatting with an AI app.',
};

const MCP_URL = `${SITE_URL}/api/mcp`;
const LINK_CLASS =
  'text-[#111] underline underline-offset-[3px] dark:text-[#eee]';
const HEADING_CLASS =
  'pt-4 text-[14px] font-medium text-[#111] dark:text-[#eee]';
const CODE_CLASS =
  'overflow-x-auto rounded-md bg-[#f5f5f5] p-3 font-mono text-[13px] text-[#111] dark:bg-[#2c2c2c] dark:text-[#eee]';

export default function ConnectPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#fff] dark:bg-[#222]">
      <main className="mx-auto w-full max-w-[540px] flex-1 px-6 py-[72px] font-sans sm:px-0">
        <h1 className="mb-4 text-[20px] font-medium text-[#111] dark:text-[#eee]">
          Connect an AI app
        </h1>

        <div className="space-y-4 text-[14px] font-normal leading-relaxed text-[#666] dark:text-[#aaa]">
          <p>
            Connect Portfoliofy to an AI app and update your profile by
            chatting: add a new job, shorten your bio, or draft a post from your
            notes. It works with apps that support remote MCP connectors.
          </p>

          <p className={HEADING_CLASS}>Connection address</p>
          <pre className={CODE_CLASS}>{MCP_URL}</pre>

          <p className={HEADING_CLASS}>Claude</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>Open Settings, then Connectors.</li>
            <li>Add a custom connector and paste the address above.</li>
            <li>Sign in with Google and click Allow access.</li>
          </ol>

          <p className={HEADING_CLASS}>Claude Code</p>
          <pre className={CODE_CLASS}>
            {`claude mcp add --transport http portfoliofy ${MCP_URL}`}
          </pre>

          <p className={HEADING_CLASS}>Cursor</p>
          <p>Add this to your MCP settings:</p>
          <pre className={CODE_CLASS}>
            {JSON.stringify(
              { mcpServers: { portfoliofy: { url: MCP_URL } } },
              null,
              2,
            )}
          </pre>

          <p className={HEADING_CLASS}>Other apps</p>
          <p>
            Look for a setting to add an MCP server or connector, and paste the
            connection address. You&apos;ll be sent to Portfoliofy to sign in.
          </p>

          <p className={HEADING_CLASS}>Things to try</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              “I joined Acme as a Product Designer. Add it to my profile.”
            </li>
            <li>“Rewrite my About section to be shorter.”</li>
            <li>“Turn these notes into a draft post.”</li>
            <li>“How many people viewed my profile this month?”</li>
          </ul>

          <p className={HEADING_CLASS}>Staying in control</p>
          <p>
            Profile changes go live straight away, so check what the app
            proposes before you agree. Posts stay as drafts until you publish
            them. If you don&apos;t like a change, ask the app to undo it.
          </p>
          <p>
            Only connect apps you trust. Text the app reads, such as a web page
            or a file, could try to influence what it does. To cut an app off,
            open Edit profile, then Settings, and click Disconnect under
            Connected apps. It loses access immediately.
          </p>
          <p>
            What a connected app does with your profile is covered by that
            app&apos;s own privacy policy. See our{' '}
            <Link href="/privacy" className={LINK_CLASS}>
              privacy policy
            </Link>{' '}
            for how Portfoliofy handles your data.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
