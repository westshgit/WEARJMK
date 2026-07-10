import { Social } from '@/payload-types'
import { knownSocialIcon } from './Const'
import { CMSLink } from './Link'

export function SocialLink({ item }: { item: NonNullable<Social['socialLinks']>[number] }) {
  const { label, newTab, reference, type, url } = item.link
  const socialLabel = label
    ? label
        .trim()
        .split(/[\s_-]+/)
        .filter(Boolean)
        .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
        .join(' ')
    : 'Social'

  const icon = knownSocialIcon[label.trim().toLowerCase() as keyof typeof knownSocialIcon]
  return (
    <CMSLink
      appearance="inline"
      className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      newTab={newTab}
      reference={reference}
      type={type}
      url={url}
    >
      {icon ? <span aria-hidden="true">{icon}</span> : null}
      <span>{socialLabel}</span>
    </CMSLink>
  )
}

export default SocialLink
