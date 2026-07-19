import { fetchCategories } from '@/lib/api/category.api'
import { HeaderClient } from './index.client'
import { getUserServer } from '@/lib/api'

export async function Header() {
  const [{ user }, categories] = await Promise.all([getUserServer(), fetchCategories()])
  return <HeaderClient categories={categories} user={user ?? undefined} />
}
