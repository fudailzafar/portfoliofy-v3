declare module 'react-twemoji' {
  import { ReactNode } from 'react';

  interface TwemojiProps {
    children?: ReactNode;
    options?: {
      className?: string;
      folder?: string;
      ext?: string;
      base?: string;
      size?: string | number;
      callback?: (
        icon: string,
        options: any,
        variant: string,
      ) => string | false;
    };
    tag?: string;
    className?: string;
    [key: string]: any;
  }

  const Twemoji: React.FC<TwemojiProps>;
  export default Twemoji;
}
