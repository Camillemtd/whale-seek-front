"use client"

import AuthButton from "../AuthButton"

export default function Header() {
  return (
    <header className="fixed top-0 right-0 ml-20 w-[calc(100%-5rem)] bg-white shadow-sm">
      <div className="px-6 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">WHAL-E</h1>
        </div>
        <AuthButton />
      </div>
    </header>
  )
}
