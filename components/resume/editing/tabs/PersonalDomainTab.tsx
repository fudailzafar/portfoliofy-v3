'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useResumeStore } from '@/store/useResumeStore';

export function PersonalDomainTab({ username }: { username: string }) {
  const { resume, updateDesign, setHasUnsavedChanges } = useResumeStore();

  const typography = resume?.design?.typography ?? 'sans';
  const theme = resume?.design?.theme ?? 'default';

  const [customDomain, setCustomDomain] = useState('');
  const [domainStatus, setDomainStatus] = useState<any>(null);
  const [isVerifyingDomain, setIsVerifyingDomain] = useState(false);

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
      : `portfoliofy-v3.vercel.app/${username}`;

  const copyValue = (value: string) => {
    navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  };

  const dnsValue =
    domainStatus?.verification?.length > 0
      ? domainStatus.verification[0].value
      : '76.76.21.21';

  return (
    <div className="max-w-2xl mx-auto h-full flex flex-col pt-8">
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900">Personal Domain</h2>
        <a
          href={
            domainStatus?.verified && customDomain
              ? `https://${customDomain}`
              : `https://portfoliofy-v3.vercel.app/${username}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md text-[13px] font-medium border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 h-8 px-4 transition-colors shadow-sm"
        >
          Visit site
        </a>
      </div>

      <div className="space-y-10">
        {/* Custom Domain */}
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <h4 className="text-gray-900 text-[14px]">Custom domain</h4>
              <p className="text-[#888888] text-[13px]">
                Optionally set a domain other than{' '}
                <a
                  href={`https://portfoliofy-v3.vercel.app/${username}`}
                  className="text-gray-900 hover:underline underline-offset-2"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  portfoliofy-v3.vercel.app/{username}
                </a>
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 max-w-[320px]">
                {domainStatus?.verified ? (
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                    <div className="bg-[#7cb44d] rounded-full p-[2px]">
                      <svg
                        className="w-[10px] h-[10px] text-white"
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
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center z-10">
                    <div className="bg-[#ebd955] text-white rounded-full w-[14px] h-[14px] flex items-center justify-center text-[10px] font-bold">
                      ?
                    </div>
                  </div>
                ) : null}
                <Input
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value.toLowerCase())}
                  placeholder="yourname.com…"
                  className={`w-full bg-[#f2f2f2] border-0 focus-visible:ring-0 shadow-none text-[13px] h-9 ${domainStatus ? 'pl-9 text-gray-700' : ''}`}
                  disabled={!!domainStatus}
                />
              </div>
              {!domainStatus ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-gray-200 text-gray-500 font-normal text-[13px] hover:text-gray-900 rounded-lg"
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
                    className="h-9 border-gray-200 text-gray-400 font-normal text-[13px] rounded-lg"
                    disabled
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 border-gray-200 text-gray-500 font-normal text-[13px] hover:text-gray-900 rounded-lg"
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
                  <div className="mt-1 relative max-w-[400px]">
                    <div className="absolute -top-[6px] left-8 w-3 h-3 bg-[#e8eedd] rotate-45 transform origin-center" />
                    <div className="relative bg-[#e8eedd] text-[#6b8949] text-[13px] px-4 py-2.5 rounded-lg">
                      Your site is published at{' '}
                      <a
                        href={`https://${customDomain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline font-medium decoration-[#6b8949] underline-offset-2"
                      >
                        {customDomain}
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 relative max-w-[500px]">
                    <div className="absolute -top-[6px] left-8 w-3 h-3 bg-[#f0eed9] rotate-45 transform origin-center" />
                    <div className="relative bg-[#f0eed9] rounded-xl overflow-hidden px-5 py-4">
                      <p className="text-[#645c38] text-[13px] mb-4">
                        Set the following record on your DNS provider to continue.
                      </p>

                      <div className="grid grid-cols-4 gap-2 text-[13px] font-medium text-[#7d754b] mb-1.5">
                        <div>Type</div>
                        <div>Name</div>
                        <div className="col-span-2">Value</div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-[13px] text-[#4a4529] items-center">
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
                        <div className="col-span-2 flex items-center justify-between group">
                          <div
                            className="bg-[#e4e0c7] px-1.5 py-0.5 rounded cursor-pointer selection:bg-transparent"
                            onClick={() => copyValue(dnsValue)}
                          >
                            {dnsValue}
                          </div>
                          <button
                            className="text-[12px] font-medium opacity-60 hover:opacity-100 transition-opacity"
                            onClick={() => copyValue(dnsValue)}
                            aria-label="Copy DNS value"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-[12px] text-[#a0a0a0] leading-relaxed">
                      Please note that changing DNS settings can take several minutes to take
                      effect. If you've already updated your DNS settings{' '}
                      <button
                        onClick={fetchDomain}
                        disabled={isVerifyingDomain}
                        className="text-gray-700 hover:text-black font-medium underline decoration-gray-300 underline-offset-2 disabled:opacity-50"
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
        <div className="space-y-4 pt-8 mt-4 border-t border-gray-100">
          <div>
            <h4 className="text-gray-900 text-[14px]">Typography</h4>
            <p className="text-[#888888] text-[13px] mt-1">
              Change the typography shown on{' '}
              <span className="text-gray-900">{siteLabel}</span>
            </p>
          </div>

          <div className="flex flex-col gap-5">
            {(
              [
                { value: 'sans', label: 'Sans', description: 'Graphik, designed by Christian Schwartz in 2009.', fontClass: 'font-sans' },
                { value: 'serif', label: 'Serif', description: 'Signifier, designed by Kris Sowersby in 2020.', fontClass: 'font-serif' },
                { value: 'mono', label: 'Mono', description: 'Diatype Mono, designed by Dinamo in 2020.', fontClass: '' },
              ] as const
            ).map(({ value, label, description, fontClass }) => (
              <div
                key={value}
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => {
                  updateDesign({ typography: value });
                  setHasUnsavedChanges(true);
                }}
              >
                <div
                  className={`flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shrink-0 transition-colors ${
                    typography === value
                      ? 'border-[2.5px] border-[#3b82f6] bg-white'
                      : 'border border-gray-200 bg-white group-hover:border-gray-300'
                  }`}
                >
                  <span className={`text-[22px] font-medium text-gray-900 tracking-tight ${fontClass}`}>
                    Aa
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] text-gray-900 font-medium">{label}</span>
                  <span className="text-[14px] text-[#737373]">{description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Theme */}
        <div className="space-y-4 pt-8 mt-4 border-t border-gray-100">
          <div>
            <h4 className="text-gray-900 text-[14px]">Theme</h4>
            <p className="text-[#888888] text-[13px] mt-1">
              Change the theme shown on {siteLabel}
            </p>
          </div>

          <div className="flex flex-col gap-5 pt-2">
            {(
              [
                { value: 'default',  label: 'Default',   description: 'Classic grayscale.',              bg: '#ffffff', fg: '#111827', border: '#e5e7eb' },
                { value: 'brutalist',label: 'Brutalist',  description: 'Raw internet materials.',         bg: '#b6b6b6', fg: '#000000', border: 'transparent' },
                { value: 'swiss',    label: 'Swiss',      description: 'International typographic style.',bg: '#e3583d', fg: '#ffffff', border: 'transparent' },
                { value: 'klein',    label: 'Klein',      description: 'International Klein Blue.',       bg: '#1538a7', fg: '#ffffff', border: 'transparent' },
                { value: 'red',      label: 'Red',        description: 'Radiates energy.',                bg: '#fcf4f0', fg: '#ea5b4d', border: 'transparent' },
                { value: 'green',    label: 'Green',      description: 'Lush and leafy.',                 bg: '#eff8eb', fg: '#4fa847', border: 'transparent' },
                { value: 'blue',     label: 'Blue',       description: 'Da ba dee da ba di.',             bg: '#eaf3fa', fg: '#267efb', border: 'transparent' },
              ] as const
            ).map(({ value, label, description, bg, fg, border }) => (
              <div
                key={value}
                className="flex items-center gap-4 cursor-pointer group"
                onClick={() => {
                  updateDesign({ theme: value });
                  setHasUnsavedChanges(true);
                }}
              >
                <div
                  className={`flex items-center justify-center w-[60px] h-[60px] rounded-[16px] shrink-0 transition-colors ${
                    theme === value ? 'border-[2.5px] border-[#3b82f6]' : 'border'
                  } group-hover:border-gray-300`}
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
                  <span className="text-[14px] text-gray-900 font-medium">{label}</span>
                  <span className="text-[14px] text-[#737373]">{description}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
