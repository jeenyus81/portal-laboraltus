const DEFAULT_MANIFEST = '/manifest.webmanifest'

export function configurePwaManifest() {
  let link = document.querySelector('link[rel="manifest"]')

  if (!link) {
    link = document.createElement('link')
    link.rel = 'manifest'
    document.head.appendChild(link)
  }

  const companyCode = decodeURIComponent(
    window.location.pathname.split('/').filter(Boolean)[0] || ''
  )

  if (!companyCode || companyCode === 'api') {
    link.href = DEFAULT_MANIFEST
    return
  }

  link.href = `/api/public/companies/${encodeURIComponent(companyCode)}/pwa-manifest.webmanifest`
}
