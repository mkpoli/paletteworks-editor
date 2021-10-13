export function download(b: Blob, filename: string) {
  const a = document.createElement('a')
  document.body.append(a)
  a.download = filename
  a.href = URL.createObjectURL(b)
  a.click()
  a.remove()
}