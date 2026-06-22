import type { QuickLink } from '@/payload-types'

import { CMSLink } from '@/components/Link'

interface Props {
  quickLinks: QuickLink[]
}

export function FooterMenu({ quickLinks }: Props) {
  if (!quickLinks?.length) return null

  return (
    <nav className="flex flex-col md:flex-row md:flex-wrap gap-4 mt-4">
      {quickLinks.map((qi) => (
        <div key={qi.id} className="h-fit md:flex-1">
          <h3 className="text-lg font-bold mb-2">{qi.header}</h3>
          <p className="text-xs text-start max-w-[20ch] text-muted-foreground mb-2">{qi.description}</p>
          <ul>
            {qi.navItems?.map((link) => (
              <li key={link.id}>
                <CMSLink appearance="link" {...link.link} />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}
