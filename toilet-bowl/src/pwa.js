import { registerSW } from 'virtual:pwa-register';

if (import.meta.env.PROD) {
  let updatePending = false;
  let applyingUpdate = false;
  let registration;
  let checking = false;

  const applyWhenIdle = () => {
    if (!updatePending || applyingUpdate || document.visibilityState !== 'visible') return;
    // Keep partially entered RSVPs and in-progress admin/uploads intact.
    if (document.querySelector('form') || document.querySelector('dialog[open]')) return;
    applyingUpdate = true;
    updateApp(true).catch((error) => {
      applyingUpdate = false;
      console.warn('Could not activate app update:', error);
    });
  };

  const checkForUpdate = async () => {
    if (!registration || !navigator.onLine || checking || document.visibilityState !== 'visible') return;
    checking = true;
    try {
      await registration.update();
      applyWhenIdle();
    } catch (error) {
      console.info('App update check deferred:', error);
    } finally {
      checking = false;
    }
  };

  const updateApp = registerSW({
    immediate: true,
    onNeedRefresh() {
      updatePending = true;
      applyWhenIdle();
    },
    onRegisteredSW(_url, serviceWorkerRegistration) {
      registration = serviceWorkerRegistration;
      checkForUpdate();
    },
    onRegisterError(error) {
      console.warn('Could not register offline support:', error);
    },
  });

  window.addEventListener('focus', checkForUpdate);
  window.addEventListener('online', checkForUpdate);
  document.addEventListener('visibilitychange', checkForUpdate);
  window.setInterval(checkForUpdate, 60 * 1000);
  window.setInterval(applyWhenIdle, 5000);
}
