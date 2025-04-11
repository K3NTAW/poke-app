import { toast as sonner } from "sonner"

type ToastOptions = {
  title?: string
  description?: string
}

export function useToast() {
  return {
    toast: ({ title, description }: ToastOptions) => {
      sonner(title, {
        description,
      })
    },
    success: (message: string) => {
      sonner.success(message)
    },
    error: (message: string) => {
      sonner.error(message)
    }
  }
} 