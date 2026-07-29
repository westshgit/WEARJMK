import { revalidatePath, revalidateTag } from 'next/cache'

export type CacheKey<T> = (args: T) => string
type RevalidateTagProfile = string | { expire?: number }

type HookArgs<CollectionHook extends (...args: never[]) => unknown> = Parameters<CollectionHook>[0]

export type GenericCollectionChangeHook<CollectionHook extends (...args: never[]) => unknown> = {
  getCacheKey: CacheKey<HookArgs<CollectionHook>>
  shouldRevalidateHook?: (args: HookArgs<CollectionHook>) => boolean
  tagOrPath:
    | {
        tag: 'tag'
        profile?: RevalidateTagProfile
      }
    | 'path'
    | 'both'
}

export function genericCollectionChangeHook<CollectionHook extends (...args: never[]) => unknown>(
  genericCollectionChangeHooks: GenericCollectionChangeHook<CollectionHook>[],
) {
  return function (
    collectionHookParameter: HookArgs<CollectionHook> & {
      doc: unknown
      req: {
        context: {
          disableRevalidate?: boolean
        }
      }
    },
  ) {
    const { doc } = collectionHookParameter
    const disableRevalidate = getDisableRevalidate(collectionHookParameter)
    if (Boolean(disableRevalidate)) return doc

    for (const gch of genericCollectionChangeHooks) {
      const { tagOrPath, getCacheKey, shouldRevalidateHook } = gch
      if (shouldRevalidateHook && !shouldRevalidateHook(collectionHookParameter)) continue

      const cacheKey = getCacheKey(collectionHookParameter)

      if (tagOrPath === 'path' || tagOrPath === 'both') revalidatePath(cacheKey)
      if (typeof tagOrPath === 'object' && 'tag' in tagOrPath && tagOrPath.tag === 'tag') {
        revalidateTag(cacheKey, tagOrPath.profile ?? 'max')
      }
      if (tagOrPath === 'both') {
        revalidateTag(cacheKey, 'max')
      }
    }

    return doc
  }
}

export function getDisableRevalidate(collectionHookParameter: { req?: { context?: { disableRevalidate?: boolean } } }): boolean {
  try {
    return Boolean(collectionHookParameter.req?.context?.disableRevalidate)
  } catch {
    return false
  }
}
