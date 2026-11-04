if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(() => {
        console.log('Service worker registered.');
      })
      .catch((error) => {
        console.error('Error registering service worker:', error);
      });
  }