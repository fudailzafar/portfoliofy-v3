'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/useResumeStore';

export function PersonalDomainTab({ username }: { username: string }) {
  const resume = useResumeStore((state) => state.resume);
  const updateDesign = useResumeStore((state) => state.updateDesign);
  const setHasUnsavedChanges = useResumeStore(
    (state) => state.setHasUnsavedChanges,
  );

  const typography = resume?.design?.typography ?? 'sans';
  const theme = resume?.design?.theme ?? 'default';

  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<any>(null);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const fetchDomain = async () => {
    setIsVerifyingDomain(true);
    try {
      const res = await fetch('/api/domain');
      const data = await res.json();
      if (data.domain) {
        setCustomDomain(data.domain);
        setDomainStatus(data.status === 'success' ? data.data : null);
      } else {
        setCustomDomain('');
        setDomainStatus(null);
      }
    } catch {}
    setIsVerifyingDomain(false);
  };

  useEffect(() => {
    fetchDomain();
  }, []);

  const handleDomainSave = async () => {
    if (!customDomain) return;
    setIsVerifyingDomain(true);
    try {
      const res = await fetch('/api/domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: customDomain }),
      });
      const data = await res.json();
      if (data.error) {
        toast.error(data.error);
      } else {
        toast.success('Domain added successfully');
        fetchDomain();
      }
    } catch {
      toast.error('Failed to add domain');
    }
    setIsVerifyingDomain(false);
  };

  const handleDomainRemove = async () => {
    setIsVerifyingDomain(true);
    try {
      const res = await fetch('/api/domain', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Domain removed');
        setCustomDomain('');
        setDomainStatus(null);
      }
    } catch {
      toast.error('Failed to remove domain');
    }
    setIsVerifyingDomain(false);
  };

  const siteLabel =
    domainStatus?.verified && customDomain
      ? customDomain
      : `portfoliofy.me/${username}`;

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const dnsValue =
    domainStatus?.verification?.length > 0
      ? domainStatus.verification[0].value
      : '76.76.21.21';

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col">
      <div className="mb-8 flex items-center justify-between border-b border-border-subtle pb-4">
        <h2 className="text-2xl font-bold text-content-primary">
          Personal Domain
        </h2>
        <a
          href={
            domainStatus?.verified && customDomain
              ? `https://${customDomain}`
              : `https://portfoliofy.me/${username}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center justify-center rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-colors active:bg-surface-3"
        >
          Visit site
        </a>
      </div>

      <div className="space-y-10">
        {/* Custom Domain */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <h4 className="text-[14px] text-content-primary">
                Custom domain
              </h4>
              <p className="text-[13px] text-[#888888]">
                Optionally set a domain other than{' '}
                <a
                  href={`https://portfoliofy.me/${username}`}
                  className="text-content-primary underline-offset-2 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  portfoliofy.me/{username}
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative max-w-[320px] flex-1">
                {domainStatus?.verified ? (
                  <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center">
                    <div className="rounded-full bg-[#7cb44d] p-[2px]">
                      <svg
                        className="h-[10px] w-[10px] text-surface-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    </div>
                  </div>
                ) : domainStatus ? (
                  <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 items-center justify-center">
                    <div className="flex h-[14px] w-[14px] items-center justify-center rounded-full bg-[#ebd955] text-[10px] font-bold text-surface-1">
                      ?
                    </div>
                  </div>
                ) : null}
                <Input
                  value={customDomain}
                  onChange={(e) =>
                    setCustomDomain(e.target.value.toLowerCase())
                  }
                  placeholder="yourname.com"
                  className={`h-9 w-full border-0 bg-surface-3 text-[13px] shadow-none focus-visible:ring-0 ${domainStatus ? 'pl-9 text-content-secondary' : ''}`}
                  disabled={!!domainStatus}
                />
              </div>
              {!domainStatus ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-md border border-border-strong bg-surface-card px-4 text-[13px] font-medium text-content-primary shadow-sm transition-colors hover:bg-surface-3"
                  onClick={handleDomainSave}
                  disabled={isVerifyingDomain || !customDomain}
                >
                  {isVerifyingDomain ? 'Saving…' : 'Save'}
                </Button>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-lg border-border-strong text-[13px] font-normal text-content-muted dark:text-content-muted"
                    disabled
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-10 rounded-lg border-border-strong text-[13px] font-normal text-content-muted hover:text-content-primary"
                    onClick={handleDomainRemove}
                    disabled={isVerifyingDomain}
                  >
                    Reset
                  </Button>
                </>
              )}
            </div>

            {domainStatus && (
              <>
                {domainStatus.verified ? (
                  <div className="relative mt-1 max-w-[400px]">
                    <div className="absolute -top-[6px] left-8 h-3 w-3 origin-center rotate-45 transform bg-[#e8eedd]" />
                    <div className="relative rounded-lg bg-[#e8eedd] px-4 py-2.5 text-[13px] text-[#6b8949]">
                      Your site is published at{' '}
                      <a
                        href={`https://${customDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium decoration-[#6b8949] underline-offset-2 hover:underline"
                      >
                        {customDomain}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="relative mt-1 max-w-[500px]">
                    <div className="absolute -top-[6px] left-8 h-3 w-3 origin-center rotate-45 transform bg-[#f0eed9]" />
                    <div className="relative overflow-hidden rounded-xl bg-[#f0eed9] px-5 py-4">
                      <p className="mb-4 text-[13px] text-[#645c38]">
                        Set the following record on your DNS provider to
                        continue.
                      </p>

                      <div className="mb-1.5 grid grid-cols-4 gap-2 text-[13px] font-medium text-[#7d754b]">
                        <div>Type</div>
                        <div>Name</div>
                        <div className="col-span-2">Value</div>
                      </div>

                      <div className="grid grid-cols-4 items-center gap-2 text-[13px] text-[#4a4529]">
                        <div>
                          {domainStatus.verification?.length > 0
                            ? domainStatus.verification[0].type
                            : 'A'}
                        </div>
                        <div>
                          {domainStatus.verification?.length > 0
                            ? domainStatus.verification[0].domain
                            : '@'}
                        </div>
                        <div className="group col-span-2 flex items-center justify-between">
                          <div
                            className="cursor-pointer rounded bg-[#e4e0c7] px-1.5 py-0.5 selection:bg-transparent"
                            onClick={() => copyValue(dnsValue)}
                          >
                            {dnsValue}
                          </div>
                          <button
                            className="text-[12px] font-medium opacity-60 transition-opacity hover:underline hover:underline-offset-4 active:opacity-100"
                            onClick={() => copyValue(dnsValue)}
                            aria-label="Copy DNS value"
                          >
                            {isCopied ? 'Copied!' : 'Copy'}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-[12px] leading-relaxed text-[#a0a0a0]">
                      Please note that changing DNS settings can take several
                      minutes to take effect. If you&apos;ve already updated
                      your DNS settings{' '}
                      <button
                        onClick={fetchDomain}
                        disabled={isVerifyingDomain}
                        className="font-medium text-content-secondary underline decoration-border-strong underline-offset-2 hover:text-content-primary disabled:opacity-50 dark:hover:text-content-muted"
                      >
                        click here to manually refresh
                      </button>
                      , or visit this page for help.
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Typography */}
        <div className="mt-4 space-y-4 border-t border-border-subtle pt-8">
          <div>
            <h4 className="text-[14px] text-content-primary">Typography</h4>
            <p className="mt-1 text-[13px] text-[#888888]">
              Change the typography shown on{' '}
              <a
                href={`${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium decoration-[#6b8949] underline-offset-2 hover:underline"
              >
                {siteLabel}
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {(
              [
                {
                  value: 'sans',
                  label: 'Sans',
                  description:
                    'Graphik, designed by Christian Schwartz in 2009.',
                  fontClass: 'font-sans',
                },
                {
                  value: 'serif',
                  label: 'Serif',
                  description: 'Signifier, designed by Kris Sowersby in 2020.',
                  fontClass: 'font-serif',
                },
                {
                  value: 'mono',
                  label: 'Mono',
                  description: 'Diatype Mono, designed by Dinamo in 2020.',
                  fontClass: '',
                },
              ] as const
            ).map(({ value, label, description, fontClass }) => (
              <div
                key={value}
                className="group flex cursor-pointer items-center gap-4"
                onClick={() => {
                  updateDesign({ typography: value });
                  setHasUnsavedChanges(true);
                }}
              >
                <div
                  className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[16px] transition-colors ${
                    typography === value
                      ? 'border-[2.5px] border-[#3b82f6] bg-surface-1'
                      : 'border border-border-strong bg-surface-card group-hover:border-border-strong dark:group-hover:border-border-strong'
                  }`}
                >
                  <span
                    className={`text-[22px] font-medium tracking-tight text-content-primary ${fontClass}`}
                  >
                    Aa
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-content-primary">
                    {label}
                  </span>
                  <span className="text-[14px] text-[#737373]">
                    {description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="mt-4 space-y-4 border-t border-border-subtle pt-8">
          <div>
            <h4 className="text-[14px] text-content-primary">Theme</h4>
            <p className="mt-1 text-[13px] text-[#888888]">
              Change the theme shown on{' '}
              <a
                href={`/${username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium decoration-[#6b8949] underline-offset-2 hover:underline"
              >
                {siteLabel}
              </a>
            </p>
          </div>

          <div className="flex flex-col gap-5 pt-2">
            {(
              [
                {
                  value: 'default',
                  label: 'Default',
                  description: 'Classic grayscale.',
                  bg: '#ffffff',
                  fg: '#111827',
                  border: '#e5e7eb',
                },
                {
                  value: 'brutalist',
                  label: 'Brutalist',
                  description: 'Raw internet materials.',
                  bg: '#b6b6b6',
                  fg: '#000000',
                  border: 'transparent',
                },
                {
                  value: 'swiss',
                  label: 'Swiss',
                  description: 'International typographic style.',
                  bg: '#e3583d',
                  fg: '#ffffff',
                  border: 'transparent',
                },
                {
                  value: 'klein',
                  label: 'Klein',
                  description: 'International Klein Blue.',
                  bg: '#1538a7',
                  fg: '#ffffff',
                  border: 'transparent',
                },
                {
                  value: 'red',
                  label: 'Red',
                  description: 'Radiates energy.',
                  bg: '#fcf4f0',
                  fg: '#ea5b4d',
                  border: 'transparent',
                },
                {
                  value: 'green',
                  label: 'Green',
                  description: 'Lush and leafy.',
                  bg: '#eff8eb',
                  fg: '#4fa847',
                  border: 'transparent',
                },
                {
                  value: 'blue',
                  label: 'Blue',
                  description: 'Da ba dee da ba di.',
                  bg: '#eaf3fa',
                  fg: '#267efb',
                  border: 'transparent',
                },
              ] as const
            ).map(({ value, label, description, bg, fg, border }) => (
              <div
                key={value}
                className="group flex cursor-pointer items-center gap-4"
                onClick={() => {
                  updateDesign({ theme: value });
                  setHasUnsavedChanges(true);
                }}
              >
                <div
                  className={`flex h-[60px] w-[60px] shrink-0 items-center justify-center rounded-[16px] transition-colors ${
                    theme === value
                      ? 'border-[2.5px] border-[#3b82f6]'
                      : 'border'
                  } group-hover:border-border-strong`}
                  style={{
                    backgroundColor: bg,
                    borderColor: theme === value ? '#3b82f6' : border,
                  }}
                >
                  <span
                    className="text-[22px] font-medium tracking-tight"
                    style={{ color: fg }}
                  >
                    Aa
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-medium text-content-primary">
                    {label}
                  </span>
                  <span className="text-[14px] text-[#737373]">
                    {description}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
