import { Logotype } from "@/components/logotype"
import Link from "next/link"

export function Footer() {
  return (
    <footer 
      id="footer" 
      className="border-t border-gray-200 bg-white" 
      role="contentinfo"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div className="flex flex-col gap-4 sm:col-span-2 md:col-span-1">
            <Link 
              href="#" 
              className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded"
            >
              <Logotype className="h-8 w-8" />
              <span className="text-xl font-bold">UnisonAI</span>
            </Link>
            <p className="text-sm text-gray-600 max-w-xs">
              The all-in-one platform for high-performance teams.
            </p>
          </div>
          
          <nav className="space-y-4" aria-label="Product links">
            <h4 className="font-semibold text-gray-900">Product</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="#features" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link 
                  href="#pricing" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  Integrations
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </nav>
          
          <nav className="space-y-4" aria-label="Company links">
            <h4 className="font-semibold text-gray-900">Company</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  About
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>
          
          <nav className="space-y-4" aria-label="Legal links">
            <h4 className="font-semibold text-gray-900">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link 
                  href="#" 
                  className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </nav>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-500 space-y-2">
          <div className="space-y-1">
            <p><strong>Contact us:</strong></p>
            <p>
              Email: 
              <a 
                href="mailto:unisonai.app@gmail.com"
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded ml-1 transition-colors"
              >
                unisonai.app@gmail.com
              </a>
            </p>
            <p>
              Instagram: 
              <a 
                href="https://instagram.com/unisonai.app"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black rounded ml-1 transition-colors"
              >
                @unisonai.app
              </a>
            </p>
          </div>
          <p className="pt-4">
            &copy; {new Date().getFullYear()} UnisonAI, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}