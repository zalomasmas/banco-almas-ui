import { Component, computed } from '@angular/core';
import { NgIf } from '@angular/common';
import { PwaService } from './pwa.service';

@Component({
  selector: 'app-pwa-install-banner',
  standalone: true,
  imports: [NgIf],
  template: `
    @if (visible()) {
      <div class="pwa-banner">
        <div class="pwa-card">
          <div class="pwa-title">Instalá la app</div>
          <div class="pwa-sub">Agregala al inicio para usarla como app</div>
          <div class="pwa-actions">
            @if (pwa.canPrompt()) {
              <button class="btn btn-dark" (click)="install()">Instalar</button>
            } @else {
              @if (pwa.isAndroid) {
                <a class="btn btn-dark" href="#" (click)="androidHelp()">Ver cómo</a>
              } @else {
                <a class="btn btn-dark" href="#" (click)="iosHelp()">Ver cómo</a>
              }
            }
            @if (pwa.needsRefresh()) {
              <button class="btn btn-outline-light" (click)="refresh()">Refrescar</button>
            }
            <button class="btn btn-outline-secondary" (click)="close()">Cerrar</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .pwa-banner { position: fixed; left: 0; right: 0; bottom: 20px; display: flex; justify-content: center; z-index: 2000; }
    .pwa-card { background: rgba(33,33,33,0.9); color: #fff; border-radius: 12px; padding: 12px 16px; max-width: 520px; width: min(92vw, 520px); box-shadow: 0 8px 24px rgba(0,0,0,0.25); }
    .pwa-title { font-weight: 600; }
    .pwa-sub { opacity: 0.9; font-size: 14px; }
    .pwa-actions { display: flex; gap: 8px; margin-top: 10px; }
  `]
})
export class PwaInstallBannerComponent {
  visible = computed(() => this.pwa.showBanner());
  constructor(public pwa: PwaService) {}
  install() {
    this.pwa.promptInstall();
  }
  androidHelp() {
    alert('En Android (Chrome): menú ⋮ > Añadir a pantalla principal. Si no aparece, actualizá y volvé a abrir.');
  }
  iosHelp() {
    alert('En iPhone: Safari > Compartir > Añadir a pantalla de inicio');
  }
  refresh() {
    location.reload();
  }
  close() {
    this.pwa.dismiss();
  }
}
