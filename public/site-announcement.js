(() => {
  const storageKey = 'pdoom-paid-data-announcement-dismissed'

  try {
    if (localStorage.getItem(storageKey) === '1') {
      document.documentElement.classList.add('paid-announcement-dismissed')
    }
  } catch {
    // The announcement remains available when storage is blocked.
  }

  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-dismiss-paid-announcement]').forEach((button) => {
      button.addEventListener('click', () => {
        try {
          localStorage.setItem(storageKey, '1')
        } catch {
          // Dismissal still applies for the current page.
        }
        document.documentElement.classList.add('paid-announcement-dismissed')
      })
    })
  })
})()
