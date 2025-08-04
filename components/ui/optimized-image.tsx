"use client";

import Image, { ImageProps } from "next/image";
import { useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImageProps, 'onError' | 'onLoad'> {
  fallbackSrc?: string;
  showLoadingState?: boolean;
  validateImageExists?: boolean;
  className?: string;
  loadingClassName?: string;
  errorClassName?: string;
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  showLoadingState = true,
  validateImageExists = false,
  className,
  loadingClassName,
  errorClassName,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(showLoadingState);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [imageExists, setImageExists] = useState(!validateImageExists);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
    setImageExists(true);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
  }, [currentSrc, fallbackSrc]);

  // Validate image existence before rendering if requested (client-side only)
  if (validateImageExists && !imageExists && !hasError && typeof window !== 'undefined') {
    const img = new window.Image();
    img.onload = () => setImageExists(true);
    img.onerror = () => {
      setImageExists(false);
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    };
    img.src = src as string;
  }

  if (hasError && currentSrc === fallbackSrc) {
    return (
      <div
        className={cn(
          "flex items-center justify-center bg-gray-100 rounded-lg",
          errorClassName,
          className
        )}
        style={{ width: props.width, height: props.height }}
      >
        <div className="text-center text-gray-500 p-4">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="mt-2 text-sm">Image not available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && showLoadingState && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10",
            loadingClassName
          )}
        >
          <div className="animate-pulse flex space-x-4">
            <div className="rounded-full bg-gray-300 h-4 w-4"></div>
            <div className="rounded-full bg-gray-300 h-4 w-4"></div>
            <div className="rounded-full bg-gray-300 h-4 w-4"></div>
          </div>
        </div>
      )}
      <Image
        {...props}
        src={currentSrc}
        alt={alt}
        className={cn(className, isLoading && showLoadingState && "opacity-0")}
        onLoad={handleLoad}
        onError={handleError}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rev//2Q=="
      />
    </div>
  );
}