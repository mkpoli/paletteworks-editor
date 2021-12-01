import { toast } from '@zerodevx/svelte-toast'

export default {
  success: (message: string) => {
    toast.push(message)
  },
  error: (message: string) => {
    toast.push(message, {
      theme: {
        '--toastBackground': '#F56565',
        '--toastBarBackground': '#C53030'
      }
    }
    )
  },
}