import type { KycServiceType } from '@server/sharedTypes'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getServiceLabel(serviceType: KycServiceType) {
  const serviceLabelMap = {
    corporate_accounting: 'Comptabilitat de societats',
    immigration: 'Immigració',
    company_formation: 'Creació de societats',
    personal_income_tax: 'IRPF',
    coworking: 'Coworking'
  }

  return serviceLabelMap[serviceType] ?? 'Unknown'
}

export function base64ToFile(base64: string): File {
  const arr = base64.split(',')
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png'
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new File([u8arr], 'signature.png', { type: mime })
}

export function getFilledNameEntries<T extends { fullName?: string }>(
  arr: T[]
): T[] {
  return arr.filter(
    item => typeof item.fullName === 'string' && item.fullName.trim().length > 0
  )
}

export const getInitials = (name?: string) => {
  if (!name) return 'U'
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
