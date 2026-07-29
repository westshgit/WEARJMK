import Link from 'next/link'

export type BrandImageProps = {
  variant?: 'big' | 'mobile'
  className?: string
}

const logoHref = {
  big: '/media/images/logo-content-full.svg#wearjmk-logo-full',
  mobile: '/media/images/logo-content-mini.svg#wearjmk-logo-mini',
} as const

const logoSizeClassName = {
  big: 'h-16 w-[155px] md:h-20 md:w-[194px]',
  mobile: 'h-6 w-[85px] md:h-8 md:w-[114px]',
} as const

const logoViewBox = {
  big: '0 0 242 100',
  mobile: '0 0 242 68',
} as const

export default function BrandImage({ variant = 'big', className }: BrandImageProps) {
  const href = logoHref[variant]
  const sizeClassName = logoSizeClassName[variant]
  const viewBox = logoViewBox[variant]

  return (
    <div className={`relative shrink-0 ${sizeClassName} ${className || ''}`}>
      <Link href="/" aria-label="Wear JMK home" className="block size-full">
        <svg aria-hidden="true" className="block size-full text-foreground" focusable="false" preserveAspectRatio="xMidYMid meet" viewBox={viewBox}>
          <use href={href} width="100%" height="100%" />
        </svg>
      </Link>
    </div>
  )
}
