import { default as accepted } from 'attr-accept'

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

export function dropHandler(accept: string, callback: (file: File) => void): (event: DragEvent) => void {
  return (event: DragEvent) => {
    if (!event.dataTransfer || event.dataTransfer.items.length === 0) return
    const item = event.dataTransfer.items[0]
    if (item.kind !== 'file') return
    const file = item.getAsFile()
    if (file && accepted(file, accept)) {
      event.stopPropagation()
      callback(file)
    }
  }
}