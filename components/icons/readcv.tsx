// read.cv's own icons, drawn from its scripts. Each takes the same props the
// Phosphor icons did (size, className, weight), so they swap in by import.
// They are single-weight and use currentColor. Icons read.cv doesn't have
// (copy, camera, the rich-text toolbar, section icons) stay on Phosphor.

import type { ComponentType, SVGProps } from 'react';

/** What a screen can accept as an icon: Phosphor's or read.cv's. */
export type IconComponent = ComponentType<{ className?: string; weight?: any }>;

type IconProps = Omit<SVGProps<SVGSVGElement>, 'width' | 'height'> & {
  size?: number | string;
  /** Accepted so existing call sites compile; these icons have one weight. */
  weight?: string;
};

function Svg({
  size,
  native,
  viewBox,
  turn = 0,
  weight: _weight,
  style,
  children,
  ...props
}: IconProps & {
  native: number;
  viewBox: string;
  turn?: number;
  children: React.ReactNode;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size ?? native}
      height={size ?? native}
      viewBox={viewBox}
      fill="currentColor"
      aria-hidden="true"
      style={turn ? { transform: `rotate(${turn}deg)`, ...style } : style}
      {...props}
    >
      {children}
    </svg>
  );
}

export function ArrowUpRightIcon(props: IconProps) {
  return (
    <Svg native={12} viewBox="0 0 12 12" {...props}>
      <path d="M3.5 3C3.22386 3 3 3.22386 3 3.5C3 3.77614 3.22386 4 3.5 4V3ZM8.5 3.5H9C9 3.22386 8.77614 3 8.5 3V3.5ZM8 8.5C8 8.77614 8.22386 9 8.5 9C8.77614 9 9 8.77614 9 8.5H8ZM2.64645 8.64645C2.45118 8.84171 2.45118 9.15829 2.64645 9.35355C2.84171 9.54882 3.15829 9.54882 3.35355 9.35355L2.64645 8.64645ZM3.5 4H8.5V3H3.5V4ZM8 3.5V8.5H9V3.5H8ZM8.14645 3.14645L2.64645 8.64645L3.35355 9.35355L8.85355 3.85355L8.14645 3.14645Z" />
    </Svg>
  );
}

export function SmileyIcon(props: IconProps) {
  return (
    <Svg native={24} viewBox="0 0 24 24" {...props}>
      <path
        d="M13.6094 9.77581C13.6094 9.04216 14.1319 8.49902 14.7165 8.49902C15.3011 8.49902 15.8237 9.04216 15.8237 9.77581C15.8237 10.5095 15.3011 11.0526 14.7165 11.0526C14.1319 11.0526 13.6094 10.5095 13.6094 9.77581Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M8.17969 9.77581C8.17969 9.04216 8.70224 8.49902 9.28683 8.49902C9.87142 8.49902 10.394 9.04216 10.394 9.77581C10.394 10.5095 9.87142 11.0526 9.28683 11.0526C8.70224 11.0526 8.17969 10.5095 8.17969 9.77581Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M8.11029 13.8779C8.40319 13.585 8.87806 13.585 9.17096 13.8779C9.89563 14.6026 10.8946 15.0494 11.9994 15.0494C13.1042 15.0494 14.1031 14.6026 14.8278 13.8779C15.1207 13.585 15.5956 13.585 15.8885 13.8779C16.1814 14.1708 16.1814 14.6456 15.8885 14.9385C14.894 15.933 13.518 16.5494 11.9994 16.5494C10.4808 16.5494 9.10478 15.933 8.1103 14.9385C7.8174 14.6456 7.8174 14.1708 8.11029 13.8779Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M12 19.5C16.1421 19.5 19.5 16.1421 19.5 12C19.5 7.85786 16.1421 4.5 12 4.5C7.85786 4.5 4.5 7.85786 4.5 12C4.5 16.1421 7.85786 19.5 12 19.5ZM12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export function PencilSimpleIcon(props: IconProps) {
  return (
    <Svg native={16} viewBox="0 0 16 16" {...props}>
      <path
        d="M1.62633 14.1206L2.35054 11.9479C2.44872 11.6534 2.61414 11.3857 2.83369 11.1662L9.99993 3.99993L11.9999 5.99994L4.83369 13.1662C4.61414 13.3857 4.34649 13.5511 4.05193 13.6493L1.87931 14.3735C1.72296 14.4257 1.57421 14.2769 1.62633 14.1206ZM12.9999 4.99993L13.9998 4.00003C14.5521 3.44774 14.5521 2.55231 13.9998 2.00003C13.4476 1.44774 12.5521 1.44774 11.9998 2.00003L10.9999 2.99993L12.9999 4.99993Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Svg native={12} viewBox="0 0 12 12" {...props}>
      <path d="M5.11372 9.83532C4.84706 9.83532 4.62745 9.72551 4.42353 9.451L2.4549 7.03532C2.33725 6.87845 2.26666 6.70591 2.26666 6.52551C2.26666 6.17257 2.54117 5.88238 2.89411 5.88238C3.12156 5.88238 3.29411 5.95296 3.49019 6.21179L5.08235 8.26669L8.43137 2.8863C8.58039 2.651 8.78431 2.52551 8.98823 2.52551C9.33333 2.52551 9.6549 2.76081 9.6549 3.12943C9.6549 3.30198 9.55294 3.48238 9.45882 3.64708L5.77255 9.451C5.60784 9.70983 5.38039 9.83532 5.11372 9.83532Z" />
    </Svg>
  );
}

export function ArrowLeftIcon(props: IconProps) {
  return (
    <Svg native={24} viewBox="0 0 24 24" {...props}>
      <path
        d="M12.3258 6.05806C12.5699 6.30214 12.5699 6.69786 12.3258 6.94194L7.26777 12L12.3258 17.0581C12.5699 17.3021 12.5699 17.6979 12.3258 17.9419C12.0817 18.186 11.686 18.186 11.4419 17.9419L5.5 12L11.4419 6.05806C11.686 5.81398 12.0817 5.81398 12.3258 6.05806Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M6.75888 12C6.75888 11.6548 7.0387 11.375 7.38388 11.375H17.8839C18.2291 11.375 18.5 11.6548 18.5 12C18.5 12.3452 18.2291 12.625 17.8839 12.625H7.38388C7.0387 12.625 6.75888 12.3452 6.75888 12Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export function ArrowRightIcon(props: IconProps) {
  return (
    <Svg native={24} viewBox="0 0 24 24" turn={180} {...props}>
      <path
        d="M12.3258 6.05806C12.5699 6.30214 12.5699 6.69786 12.3258 6.94194L7.26777 12L12.3258 17.0581C12.5699 17.3021 12.5699 17.6979 12.3258 17.9419C12.0817 18.186 11.686 18.186 11.4419 17.9419L5.5 12L11.4419 6.05806C11.686 5.81398 12.0817 5.81398 12.3258 6.05806Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
      <path
        d="M6.75888 12C6.75888 11.6548 7.0387 11.375 7.38388 11.375H17.8839C18.2291 11.375 18.5 11.6548 18.5 12C18.5 12.3452 18.2291 12.625 17.8839 12.625H7.38388C7.0387 12.625 6.75888 12.3452 6.75888 12Z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export function CaretLeftIcon(props: IconProps) {
  return (
    <Svg native={16} viewBox="0 0 16 16" {...props}>
      <path d="M8.303 12.24a.75.75 0 000-1.06l-2.43-2.43h6.377a.75.75 0 000-1.5H5.869l2.434-2.434a.75.75 0 00-1.06-1.061L3.53 7.467a.75.75 0 000 1.061l3.713 3.712a.75.75 0 001.06 0z" />
    </Svg>
  );
}

export function DotsThreeIcon(props: IconProps) {
  return (
    <Svg native={16} viewBox="0 0 16 16" {...props}>
      <circle cx="3.76" cy="8.01" r="1.26" />
      <circle cx="8.01" cy="8.01" r="1.26" />
      <circle cx="12.26" cy="8.01" r="1.26" />
    </Svg>
  );
}

export function CaretDownIcon(props: IconProps) {
  return (
    <Svg native={16} viewBox="0 0 16 16" {...props}>
      <path d="M12.3536 6.35355C12.5488 6.15829 12.5488 5.84171 12.3536 5.64645C12.1583 5.45118 11.8417 5.45118 11.6464 5.64645L12.3536 6.35355ZM8 10L7.64645 10.3536C7.84171 10.5488 8.15829 10.5488 8.35355 10.3536L8 10ZM4.35355 5.64645C4.15829 5.45118 3.84171 5.45118 3.64645 5.64645C3.45118 5.84171 3.45118 6.15829 3.64645 6.35355L4.35355 5.64645ZM11.6464 5.64645L7.64645 9.64645L8.35355 10.3536L12.3536 6.35355L11.6464 5.64645ZM8.35355 9.64645L4.35355 5.64645L3.64645 6.35355L7.64645 10.3536L8.35355 9.64645Z" />
    </Svg>
  );
}

export function CaretUpIcon(props: IconProps) {
  return (
    <Svg native={16} viewBox="0 0 16 16" turn={180} {...props}>
      <path d="M12.3536 6.35355C12.5488 6.15829 12.5488 5.84171 12.3536 5.64645C12.1583 5.45118 11.8417 5.45118 11.6464 5.64645L12.3536 6.35355ZM8 10L7.64645 10.3536C7.84171 10.5488 8.15829 10.5488 8.35355 10.3536L8 10ZM4.35355 5.64645C4.15829 5.45118 3.84171 5.45118 3.64645 5.64645C3.45118 5.84171 3.45118 6.15829 3.64645 6.35355L4.35355 5.64645ZM11.6464 5.64645L7.64645 9.64645L8.35355 10.3536L12.3536 6.35355L11.6464 5.64645ZM8.35355 9.64645L4.35355 5.64645L3.64645 6.35355L7.64645 10.3536L8.35355 9.64645Z" />
    </Svg>
  );
}

export function LockIcon(props: IconProps) {
  return (
    <Svg native={16} viewBox="0 0 16 16" {...props}>
      <path
        d="M5.75 4.75a2.25 2.25 0 014.5 0v1.5h-4.5v-1.5zm-1.5 1.52V4.75a3.75 3.75 0 117.5 0v1.52A1.5 1.5 0 0113 7.75v5a1.5 1.5 0 01-1.5 1.5h-7a1.5 1.5 0 01-1.5-1.5v-5a1.5 1.5 0 011.25-1.48z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export function BriefcaseIcon(props: IconProps) {
  return (
    <Svg native={28} viewBox="0 0 28 28" {...props}>
      <path d="M16.5,5 C17.8807119,5 19,6.11928813 19,7.5 L19,9 L20,9 C21.6568542,9 23,10.3431458 23,12 L23,19 C23,20.6568542 21.6568542,22 20,22 L8,22 C6.34314575,22 5,20.6568542 5,19 L5,12 C5,10.3431458 6.34314575,9 8,9 L9,9 L9,7.5 C9,6.11928813 10.1192881,5 11.5,5 L16.5,5 Z M20,10.5 L8,10.5 C7.22030388,10.5 6.57955132,11.0948881 6.50686658,11.85554 L6.5,12 L6.5,19 C6.5,19.7796961 7.09488808,20.4204487 7.85553999,20.4931334 L8,20.5 L20,20.5 C20.7796961,20.5 21.4204487,19.9051119 21.4931334,19.14446 L21.5,19 L21.5,12 C21.5,11.2203039 20.9051119,10.5795513 20.14446,10.5068666 L20,10.5 Z M16.5,6.5 L11.5,6.5 C10.9871642,6.5 10.5644928,6.88604019 10.5067277,7.38337887 L10.5,7.5 L10.5,9 L17.5,9 L17.5,7.5 C17.5,6.98716416 17.1139598,6.56449284 16.6166211,6.50672773 L16.5,6.5 Z" />
    </Svg>
  );
}

export function ChatCircleIcon(props: IconProps) {
  return (
    <Svg native={24} viewBox="0 0 24 24" {...props}>
      <path
        d="M3.875 10.5A6.125 6.125 0 0110 4.375h4a6.125 6.125 0 013.6 11.08l-5.939 4.315a.625.625 0 01-.978-.638l.542-2.507H10A6.125 6.125 0 013.875 10.5zm14.07-2.866A4.868 4.868 0 0014 5.625h-4a4.875 4.875 0 100 9.75h1.69c.558 0 .973.515.855 1.06l-.294 1.362 4.615-3.353a4.875 4.875 0 001.078-6.81z"
        fillRule="evenodd"
        clipRule="evenodd"
      />
    </Svg>
  );
}

export function XIcon(props: IconProps) {
  return (
    <Svg native={16} viewBox="0 0 16 16" {...props}>
      <path d="M12.243 3.757a.75.75 0 00-1.061 0L8 6.94 4.818 3.757a.75.75 0 10-1.06 1.061L6.938 8l-3.182 3.182a.75.75 0 101.061 1.06L8 9.062l3.182 3.182a.75.75 0 101.06-1.061L9.062 8l3.182-3.182a.75.75 0 000-1.06z" />
    </Svg>
  );
}
