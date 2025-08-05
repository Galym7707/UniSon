/* --------------------------------------------------------
   components/ui/optimized-image.tsx
   -------------------------------------------------------- */
   'use client'

   import Image, { ImageProps } from 'next/image'
   import { useState, useEffect, useCallback } from 'react'
   import { cn } from '@/lib/utils'
   
   /* -------------------------------------------------- *
    * Типы
    * -------------------------------------------------- */
   interface OptimizedImageProps
     extends Omit<ImageProps, 'onLoad' | 'onError'> {
     /** Фолбэк-картинка, если основная не загрузилась */
     fallbackSrc?: string
     /** Показывать ли скелет-лоадер, пока картинка грузится */
     showLoadingState?: boolean
     /** Проверять ли существование изображения перед выводом */
     validateImageExists?: boolean
     /** Доп. классы */
     className?: string
     loadingClassName?: string
     errorClassName?: string
   }
   
   /* -------------------------------------------------- *
    * Компонент
    * -------------------------------------------------- */
   export function OptimizedImage({
     src,
     alt,
     fallbackSrc = '/placeholder.svg',
     showLoadingState = true,
     validateImageExists = false,
     className,
     loadingClassName,
     errorClassName,
     ...props
   }: OptimizedImageProps) {
     /* ---------- state ---------- */
     const [currentSrc, setCurrentSrc] = useState(src)
     const [isLoading, setIsLoading]   = useState(showLoadingState)
     const [hasError, setHasError]     = useState(false)
   
     /* ---------- проверка существования изображения ---------- */
     useEffect(() => {
       if (!validateImageExists || typeof window === 'undefined') return
   
       let cancelled = false
       const img = new window.Image()
   
       img.onload = () => {
         if (!cancelled) setHasError(false)
       }
       img.onerror = () => {
         if (!cancelled) {
           setHasError(true)
           setCurrentSrc(fallbackSrc)
         }
       }
   
       img.src = src as string
   
       return () => {
         cancelled = true
       }
     }, [src, fallbackSrc, validateImageExists])
   
     /* ---------- коллбэки onLoad / onError ---------- */
     const handleLoad = useCallback(() => {
       setIsLoading(false)
       setHasError(false)
     }, [])
   
     const handleError = useCallback(() => {
       setIsLoading(false)
       setHasError(true)
       if (currentSrc !== fallbackSrc) setCurrentSrc(fallbackSrc)
     }, [currentSrc, fallbackSrc])
   
     /* ---------- рендер ---------- */
     // ▸ Показать «картинка недоступна»
     if (hasError && currentSrc === fallbackSrc) {
       return (
         <div
           className={cn(
             'flex items-center justify-center bg-gray-100 rounded-lg',
             errorClassName,
             className
           )}
           style={{ width: props.width, height: props.height }}
         >
           <svg
             className="h-12 w-12 text-gray-400"
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
         </div>
       )
     }
   
     return (
       <div className="relative">
         {/* --- скелет-лоадер --- */}
         {isLoading && showLoadingState && (
           <div
             className={cn(
               'absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10',
               loadingClassName
             )}
           >
             <div className="animate-pulse flex space-x-2">
               <div className="h-3 w-3 rounded-full bg-gray-300" />
               <div className="h-3 w-3 rounded-full bg-gray-300" />
               <div className="h-3 w-3 rounded-full bg-gray-300" />
             </div>
           </div>
         )}
   
         {/* --- само изображение --- */}
         <Image
           {...props}
           src={currentSrc}
           alt={alt}
           onLoad={handleLoad}
           onError={handleError}
           className={cn(
             className,
             isLoading && showLoadingState && 'opacity-0 transition-opacity duration-300'
           )}
           placeholder={props.placeholder ?? 'empty'}
         />
       </div>
     )
   }
   
   export default OptimizedImage
   