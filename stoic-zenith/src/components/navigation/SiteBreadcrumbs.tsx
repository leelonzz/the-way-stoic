'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Home } from 'lucide-react'
import { Fragment } from 'react'

interface BreadcrumbItem {
  label: string
  href: string
  isActive?: boolean
}

// Route label mapping
const routeLabels: Record<string, string> = {
  '': 'Home',
  quotes: 'Quotes',
  journal: 'Journal',
  mentors: 'Mentors',
  calendar: 'Calendar',
  settings: 'Settings',
  profile: 'Profile',
  blog: 'Blog',
  events: 'Events',
  places: 'Places',
  biography: 'Biography',
  contact: 'Contact',
  support: 'Support',
  privacy: 'Privacy',
  terms: 'Terms',
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbItem[] = []

  // Always start with home
  if (segments.length > 0) {
    breadcrumbs.push({
      label: 'Home',
      href: '/',
    })
  }

  // Build breadcrumbs from path segments
  let currentPath = ''
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const label =
      routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1)

    breadcrumbs.push({
      label,
      href: currentPath,
      isActive: index === segments.length - 1,
    })
  })

  return breadcrumbs
}

function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: `https://thewaystoic.site${crumb.href}`,
    })),
  }
}

interface SiteBreadcrumbsProps {
  className?: string
  hideOnHome?: boolean
}

export function SiteBreadcrumbs({
  className,
  hideOnHome = true,
}: SiteBreadcrumbsProps) {
  const pathname = usePathname()

  // Don't show breadcrumbs on home page if hideOnHome is true
  if (hideOnHome && pathname === '/') {
    return null
  }

  const breadcrumbs = generateBreadcrumbs(pathname)

  // Don't show if only one item (Home)
  if (breadcrumbs.length <= 1) {
    return null
  }

  const structuredData = generateBreadcrumbStructuredData(breadcrumbs)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Breadcrumb className={className}>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => (
            <Fragment key={crumb.href}>
              <BreadcrumbItem>
                {crumb.isActive ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={crumb.href}>
                      {index === 0 ? (
                        <span className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          {crumb.label}
                        </span>
                      ) : (
                        crumb.label
                      )}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < breadcrumbs.length - 1 && <BreadcrumbSeparator />}
            </Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}
