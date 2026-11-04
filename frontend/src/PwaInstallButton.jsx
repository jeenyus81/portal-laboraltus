import './pwa-install.css'

export default function PwaInstallButton({ installPrompt, onPromptConsumed }) {
  async function handleInstall() {
    if (installPrompt) {
      try {
        await installPrompt.prompt()
        await installPrompt.userChoice
      } finally {
        onPromptConsumed()
      }
      return
    }

    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      navigator.standalone === true

    const appleDevice =
      /iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)

    if (standalone) {
      window.alert(
        'LaboralTus ya está instalada en este dispositivo. ' +
        'Puedes instalarla también en otros dispositivos.'
      )
    } else if (appleDevice) {
      window.alert(
        'En Safari, pulsa Compartir y selecciona Añadir a pantalla de inicio.'
      )
    } else {
      window.alert(
        'Chrome todavía no ha ofrecido la instalación a esta página. ' +
        'Puedes utilizar la opción Instalar de la barra de direcciones.'
      )
    }
  }

  return (
    <button
      type="button"
      className="pwa-install-button"
      onClick={handleInstall}
    >
      Instalar portal LaboralTus
    </button>
  )
}