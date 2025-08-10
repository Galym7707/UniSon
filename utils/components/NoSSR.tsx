import dynamic from 'next/dynamic'
import { ReactNode } from 'react'

interface NoSSRProps {
  children: ReactNode
}

const NoSSR = dynamic(
  () => import('react').then(mod => ({ 
    default: ({ children }: NoSSRProps) => children 
  })),
  { ssr: false }
)

export default NoSSR