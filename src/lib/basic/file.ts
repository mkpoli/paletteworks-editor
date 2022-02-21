import { default as accepted } from 'attr-accept'

export async function download(b: Blob, filename: string): Promise<void> {
  if (!window.__TAURI__) {
    const a = document.createElement('a')
    document.body.append(a)
    a.download = filename
    a.href = URL.createObjectURL(b)
    a.click()
    a.remove()
  } else {
    const { tauri, dialog } = await import('@tauri-apps/api')
    const defaultSavePath = window.localStorage.getItem('default-save-path')
    const path = await dialog.save({
      defaultPath: defaultSavePath ? defaultSavePath + filename : filename,
    })
    await tauri.invoke('write_file', {
      path,
      data: [...new Uint8Array(await b.arrayBuffer())]
    })
    window.localStorage.setItem('default-save-path', path.slice(0, path.lastIndexOf('/')))
    // await fs.writeBinaryFile({
    //   contents: ,
    //   path,
    // })
  }
}

export function toBlob(content: string) {
  const blob = new Blob([content], {type: 'text/sus+plain'})
  return blob
}

export function dropHandler(accept: string, callback: (file: File) => void, onerror: () => void): (event: DragEvent) => void {
  return (event: DragEvent) => {
    if (!event.dataTransfer || event.dataTransfer.items.length === 0) return
    const item = event.dataTransfer.items[0]
    if (item.kind !== 'file') return
    const file = item.getAsFile()
    event.stopPropagation()
    if (file && accepted(file, accept)) {
      callback(file)
    } else {
      onerror()
    }
  }
}

export function dropHandlerMultiple(handlers: { accept: string, callback: (file: File) => void }[], onerror: () => void): (event: DragEvent) => void {
  return (event: DragEvent) => {
    if (!event.dataTransfer || event.dataTransfer.items.length === 0) return
    const item = event.dataTransfer.items[0]
    if (item.kind !== 'file') return
    const file = item.getAsFile()
    event.stopPropagation()
    for (const { accept, callback } of handlers) {
      if (file && accepted(file, accept)) {
        callback(file)
        return
      }
    }
    onerror()
  }
}

export type FormatData = {
  project: string,
  title: string,
  artist: string,
  author: string,
}
export const SUPPORTED_FORMAT_KEYWORDS = ['project', 'title', 'artist', 'author', 'datetime', 'date']
export function formatFilename(format: string, data: FormatData): string {
  return format.replace(/{([^}]+)}/g, (match, key: string | undefined) => {
    switch (key) {
      case 'project':
      case 'title':
      case 'artist':
      case 'author':
        return data[key]
      case 'datetime':
        return new Date().toISOString().replace(/:/g, '-')
      case 'date':
        return new Date().toISOString().split('T')[0]
      default:
        return match
    }
  })
}
