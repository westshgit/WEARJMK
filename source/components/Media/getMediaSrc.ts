export const getMediaSrc = ({
  filename,
  url,
}: {
  filename?: string | null
  url?: string | null
}) => {
  if (url) return url
  if (filename) return `/media/${filename}`

  return ''
}
