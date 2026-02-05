import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { BottomNavComponent } from './bottom-nav.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, BottomNavComponent, NgIf],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {
  hideNav = false;
  constructor(private router: Router) {
    this.hideNav = this.shouldHide(this.router.url);
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.hideNav = this.shouldHide(e.urlAfterRedirects);
      }
    });
  }
  private shouldHide(url: string) {
    return url.startsWith('/app/nuevo/editor');
  }
}
