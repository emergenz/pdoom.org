(() => {
  // Dismissing hides the announcement for the current page only; it is not
  // persisted, so a reload brings it back.
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-dismiss-paid-announcement]').forEach((button) => {
      button.addEventListener('click', () => {
        document.documentElement.classList.add('paid-announcement-dismissed')
      })
    })
  })
})()
