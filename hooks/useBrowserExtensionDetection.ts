"use client"

import { useEffect, useState } from "react"

interface ExtensionDetectionResult {
  grammarly: boolean
  hasProblematicExtensions: boolean
}

export function useBrowserExtensionDetection(): ExtensionDetectionResult {
  const [extensions, setExtensions] = useState<ExtensionDetectionResult>({
    grammarly: false,
    hasProblematicExtensions: false,
  })

  useEffect(() => {
    // Only run on client side after initial render
    const detectExtensions = () => {
      // Check for Grammarly extension attributes
      const hasGrammarlyExt = document.documentElement.hasAttribute("data-gr-ext-installed")
      const hasGrammarlyCheck = document.documentElement.hasAttribute("data-new-gr-c-s-check-loaded")
      
      // Look for other Grammarly indicators
      const hasGrammarlyStyle = !!document.querySelector('[data-gr-c-s-loaded]')
      const hasGrammarlyElements = !!document.querySelector('.gr_-_')
      
      const grammarlyDetected = hasGrammarlyExt || hasGrammarlyCheck || hasGrammarlyStyle || hasGrammarlyElements
      
      // Add other problematic extensions here in the future
      const hasProblematic = grammarlyDetected
      
      setExtensions({
        grammarly: grammarlyDetected,
        hasProblematicExtensions: hasProblematic,
      })
    }

    // Initial detection
    detectExtensions()
    
    // Watch for DOM changes that might indicate extension loading
    const observer = new MutationObserver(() => {
      detectExtensions()
    })
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [
        "data-gr-ext-installed", 
        "data-new-gr-c-s-check-loaded",
        "data-gr-c-s-loaded"
      ],
      subtree: true,
    })
    
    return () => observer.disconnect()
  }, [])

  return extensions
}