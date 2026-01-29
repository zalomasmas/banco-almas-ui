import { Injectable, signal } from '@angular/core';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<any>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

@Injectable({ providedIn: 'root' })
export class PwaService {
  private deferred = signal<BeforeInstallPromptEvent | null>(null);
  isInstalled = signal<boolean>(false);
  showBanner = signal<boolean>(false);
  private isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  isAndroid = /Android/i.test(navigator.userAgent);
  isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);

  constructor() {
    const installedFlag = localStorage.getItem('pwa_installed') === 'true';
    const standalone =
      (typeof window.matchMedia === 'function' &&
        window.matchMedia('(display-mode: standalone)').matches) ||
      (window as any).navigator['standalone'];
    this.isInstalled.set(installedFlag || !!standalone);
    if (!this.isInstalled() && this.isMobile) this.showBanner.set(true);
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', async () => {
        try {
          const reg = await navigator.serviceWorker.getRegistration();
          if (!reg) {
            await navigator.serviceWorker.register('/sw.js');
          }
        } catch {}
      });
    }
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      const ev = e as BeforeInstallPromptEvent;
      this.deferred.set(ev);
      if (!this.isInstalled() && this.isMobile) this.showBanner.set(true);
    });
    window.addEventListener('appinstalled', () => {
      this.isInstalled.set(true);
      localStorage.setItem('pwa_installed', 'true');
      this.showBanner.set(false);
      this.deferred.set(null);
    });
  }

  canPrompt() {
    return !!this.deferred();
  }
  needsRefresh() {
    return !navigator.serviceWorker.controller;
  }

  async promptInstall() {
    const ev = this.deferred();
    if (!ev) return;
    await ev.prompt();
    const choice = await ev.userChoice;
    if (choice.outcome === 'accepted') {
      this.showBanner.set(false);
    }
  }

  dismiss() {
    this.showBanner.set(false);
  }
}
