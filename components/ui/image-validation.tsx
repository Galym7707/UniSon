"use client";

import { useState, useEffect } from "react";

interface ImageValidationHookResult {
  isValid: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useImageValidation(src: string, enabled: boolean = true): ImageValidationHookResult {
  const [isValid, setIsValid] = useState(false);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled || !src) {
      setIsValid(true);
      setIsLoading(false);
      return;
    }

    if (typeof window === 'undefined') {
      setIsValid(true);
      setIsLoading(false);
      return;
    }

    const img = new Image();
    
    img.onload = () => {
      setIsValid(true);
      setIsLoading(false);
      setError(null);
    };
    
    img.onerror = () => {
      setIsValid(false);
      setIsLoading(false);
      setError('Failed to load image');
    };
    
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, enabled]);

  return { isValid, isLoading, error };
}

interface ImageExistenceCheckerProps {
  src: string;
  onExists: (exists: boolean) => void;
  children?: React.ReactNode;
}

export function ImageExistenceChecker({ src, onExists, children }: ImageExistenceCheckerProps) {
  const { isValid, isLoading } = useImageValidation(src, true);

  useEffect(() => {
    if (!isLoading) {
      onExists(isValid);
    }
  }, [isValid, isLoading, onExists]);

  return <>{children}</>;
}