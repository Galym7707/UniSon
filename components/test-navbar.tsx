'use client'

import Navbar from './Navbar'

export default function TestNavbar() {
  return (
    <div>
      <Navbar 
        isAuthenticated={true}
        userEmail="test@example.com"
        userName="Test User"
      />
      <div className="p-8">
        <h1 className="text-2xl font-bold">Test page content</h1>
        <p>This is a test page to verify the Navbar component works correctly.</p>
      </div>
    </div>
  )
}