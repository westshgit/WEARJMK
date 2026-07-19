import type { Category } from '@/payload-types'

export function createCategoryHref(category: Pick<Category, 'id' | 'slug'>): string | null {
  if (category?.slug) {
    return `/shop?category=${category.id}`
  }

  return null
}
