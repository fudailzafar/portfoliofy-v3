import { CustomSpinner } from '@/components/CustomSpinner';
import React from 'react';

interface LoadingFallbackProps {
  message: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ message }) => {
  return (
    <div className="flex h-[80vh] flex-col items-center justify-center">
      <CustomSpinner className="mr-2 h-10 w-10" />
      <p className="mt-2.5 max-w-[400px] text-center text-lg">{message}</p>
    </div>
  );
};

export default LoadingFallback;
