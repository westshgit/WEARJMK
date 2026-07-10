import type { ReactNode } from 'react'

import Link from 'next/link'

type HelpfulLink = {
  href: string
  label: string
}

type HelpfulLinksProps = {
  label?: string
  links: Array<HelpfulLink | ReactNode>
}

const isHelpfulLink = (link: HelpfulLink | ReactNode): link is HelpfulLink =>
  typeof link === 'object' && link !== null && 'label' in link && 'href' in link

export default function HelpfulLinks({
  label = 'Other helpful links:',
  links,
}: HelpfulLinksProps) {
  return (
    <div className="w-full max-w-md border-t pt-8">
      <p className="mb-4 text-sm text-muted-foreground">{label}</p>

      <ul className="mb-6 space-y-2 text-sm">
        {links.map((link, index) => (
          <HelpfulLinksItem key={index} link={link} />
        ))}
      </ul>
    </div>
  )
}

function HelpfulLinksItem({ link }: { link: HelpfulLink | ReactNode }) {
  if (isHelpfulLink(link)) {
    return (
      <li>
        <Link href={link.href} className="text-primary hover:underline">
          {link.label}
        </Link>
      </li>
    )
  }

  return <>{link}</>
}
