import { useEffect, useState } from 'react'
import './pwa-install.css'

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState(null)

  useEffect(() => {
    const capturePrompt = (event) => {
      event.preventDefault()
      setInstallPrompt(event)
    }
    window.addEventListener('beforeinstallprompt', capturePrompt)
    return () => window.removeEventListener('beforeinstallprompt', capturePrompt)
  }, [])

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt()
      await installPrompt.userChoice
      setInstallPrompt(null)
      return
    }

    const appleDevice =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true

    if (appleDevice && !standalone) {
      window.alert(
        'Para instalar LaboralTus:\n\n' +
        '1. Abre esta página en Safari.\n' +
        '2. Pulsa Compartir.\n' +
        '3. Selecciona «Añadir a pantalla de inicio».\n' +
        '4. Confirma «Añadir».'
      )
    } else if (standalone) {
      window.alert(
        'LaboralTus ya está instalada en este dispositivo. ' +
        'Para instalarla en otro, abre el portal desde ese dispositivo.'
      )
    } else {
      window.alert(
        'Abre el menú del navegador y busca «Instalar aplicación» ' +
        'o «Añadir a pantalla de inicio», si está disponible.'
      )
    }
  }

  return (
    <button
      type="button"
      className="pwa-install-button"
      onClick={handleInstall}
      aria-label="Instalar portal LaboralTus"
    >
      <span aria-hidden="true">↓</span>
      Instalar portal LaboralTus
    </button>
  )
}