export async function confirm(message: string): Promise<boolean> {
  if (window.__TAURI__) {
    return window.__TAURI__.dialog.confirm(message);
  }
  return new Promise<boolean>((resolve) => {
    resolve(window.confirm(message))
  })
}
