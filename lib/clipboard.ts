import { toast } from 'sonner'

export const copyToClipboard = (async (url: string) => {
  await navigator.clipboard.writeText(url)
  toast.success('Copied to clipboard!')

  return
})
