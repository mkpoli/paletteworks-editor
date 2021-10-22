export function download(b: Blob, filename: string) {
  const a = document.createElement('a')
  document.body.append(a)
  a.download = filename
  a.href = URL.createObjectURL(b)
  a.click()
  a.remove()
}

export function toBlob(content: string) {
  const blob = new Blob([content], {type: 'text/sus+plain'})
  return blob
}