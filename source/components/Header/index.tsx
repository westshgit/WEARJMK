import { fetchCategories } from '@/lib/api/category.api'
import { HeaderClient } from './index.client'
import { getUserServer } from '@/lib/api'

export async function Header() {
  const { user } = await getUserServer()
  return <HeaderClient user={user ?? undefined} />
}
