'use client'

import type React from 'react'
import { useState, useEffect } from 'react'

import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface HeaderProps {
  onGetStarted?: () => void
}

export function Header({ onGetStarted }: HeaderProps) {
  const [isSticky, setIsSticky] = useState(false)

  console.log('Header render - isSticky:', isSticky)

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Philosophy', href: '#philosophy' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ]

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      console.log(
        'Scroll position:',
        scrollPosition,
        'IsSticky:',
        scrollPosition > 100
      )
      setIsSticky(scrollPosition > 100)
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    e.preventDefault()
    const targetId = href.substring(1)
    const targetElement = document.getElementById(targetId)
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${
        isSticky ? 'bg-[#f8f4ec] shadow-sm py-4' : 'bg-transparent py-6 md:py-8'
      }`}
      style={{ border: isSticky ? '2px solid red' : '2px solid blue' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-16">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative h-8 w-8 md:h-12 md:w-12">
            <Image
              src="/images/logo-icon.png"
              alt="Logo"
              fill
              className="object-contain"
            />
          </div>
        </div>

        {/* Navigation Items - Hidden on mobile */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-16">
          {navItems.map(item => (
            <Link
              key={item.name}
              href={item.href}
              onClick={e => handleScroll(e, item.href)}
              className={`font-inknut text-base xl:text-lg hover:opacity-80 transition-opacity cursor-pointer ${
                isSticky ? 'text-gray-800' : 'text-white'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button and Login Button */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onGetStarted}
            className="hidden lg:block bg-primary hover:bg-primary/90 text-white font-inknut text-sm md:text-base xl:text-lg px-4 md:px-8 py-2 md:py-3 transition-colors"
          >
            Log in
          </Button>

          <Sheet>
            <SheetTrigger asChild className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                className={`hover:bg-white/10 ${
                  isSticky ? 'text-gray-800' : 'text-white'
                }`}
              >
                <Menu className="h-6 w-6" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="bg-black/90 backdrop-blur-sm border-t border-white/20 text-white"
            >
              <SheetHeader>
                <SheetTitle className="text-left text-xl font-semibold text-white">
                  Navigation
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-6">
                {navItems.map(item => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={e => handleScroll(e, item.href)}
                    className="text-white font-inknut text-lg hover:opacity-80 transition-opacity py-2"
                  >
                    {item.name}
                  </Link>
                ))}
                <Button
                  onClick={onGetStarted}
                  className="w-full mt-4 bg-primary hover:bg-primary/90 text-white font-inknut text-base px-6 py-3"
                >
                  Log in
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
