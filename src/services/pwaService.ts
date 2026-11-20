// PWA Service Worker Registration & Live Update Manager
type UpdateCallback = () => void;
type InstallCallback = (promptEvent: any) => void;

class PwaService {
  private registration: ServiceWorkerRegistration | null = null;
  private updateListeners: Set<UpdateCallback> = new Set();
  private installListeners: Set<InstallCallback> = new Set();
  private deferredPrompt: any = null;
  private isUpdateReady = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        this.deferredPrompt = e;
        this.installListeners.forEach((fn) => fn(e));
      });

      window.addEventListener('appinstalled', () => {
        this.deferredPrompt = null;
        this.installListeners.forEach((fn) => fn(null));
      });
    }
  }

  public register(): void {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', async () => {
      try {
        const swUrl = `${import.meta.env.BASE_URL}sw.js`;
        const reg = await navigator.serviceWorker.register(swUrl);
        this.registration = reg;
        console.log('[PWA] Registered Service Worker with scope:', reg.scope);

        // 1. Check if an update is already waiting (e.g. from previous background install)
        if (reg.waiting) {
          this.notifyUpdateReady();
        }

        // 2. Listen for newly detected updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            // When the new worker is installed and there was already an active worker, update is ready!
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdateReady();
            }
          });
        });

        // 3. Check for updates whenever the window/PWA gains focus
        window.addEventListener('focus', () => {
          this.checkForUpdates();
        });

        // 4. Periodic background update check (every 15 minutes)
        setInterval(() => {
          this.checkForUpdates();
        }, 15 * 60 * 1000);

      } catch (err) {
        console.warn('[PWA] Service Worker registration failed:', err);
      }
    });

    // When the new service worker takes over, reload the window to run new code
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }

  public async checkForUpdates(): Promise<void> {
    if (!this.registration) return;
    try {
      await this.registration.update();
    } catch (err) {
      console.debug('[PWA] Update check failed (likely offline):', err);
    }
  }

  public applyUpdate(): void {
    if (!this.registration || !this.registration.waiting) {
      window.location.reload();
      return;
    }
    // Post message to waiting service worker to skip waiting and activate
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  public onUpdateAvailable(callback: UpdateCallback): () => void {
    this.updateListeners.add(callback);
    if (this.isUpdateReady) {
      callback();
    }
    return () => this.updateListeners.delete(callback);
  }

  public onInstallPrompt(callback: InstallCallback): () => void {
    this.installListeners.add(callback);
    if (this.deferredPrompt) {
      callback(this.deferredPrompt);
    }
    return () => this.installListeners.delete(callback);
  }

  public async promptInstall(): Promise<boolean> {
    if (!this.deferredPrompt) return false;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      this.deferredPrompt = null;
      this.installListeners.forEach((fn) => fn(null));
      return true;
    }
    return false;
  }

  private notifyUpdateReady(): void {
    this.isUpdateReady = true;
    this.updateListeners.forEach((fn) => fn());
  }
}

export const pwaService = new PwaService();
