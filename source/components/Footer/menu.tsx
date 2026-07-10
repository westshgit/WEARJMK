import type { Footer } from '@/payload-types'
import { CMSLink } from '../Link'

interface Props {
  navItems: Footer['navItems']
}

export function FooterMenu({ navItems }: Props) {
  if (!navItems?.length) return null

  return (
    <div className="space-y-6 lg:space-y-0 lg:flex lg:items-center lg:gap-8">
      {navItems.map((navItem, index) => (
        <nav key={index} aria-label={navItem.label} className="space-y-5 min-w-64">
          <h6 className="text-3xl">{navItem.label}</h6>
          <ul>
            {navItem?.items?.map((item) => {
              return (
                <li key={item.id}>
                  <CMSLink
                    appearance="link"
                    className="text-base text-foreground/50 hover:text-foreground transition-all duration-300 ease-in-out"
                    {...item.link}
                  />
                </li>
              )
            })}
          </ul>
        </nav>
      ))}
    </div>
  )
}
