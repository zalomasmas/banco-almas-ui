import { Component } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BottomNavComponent } from './bottom-nav.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, BottomNavComponent],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss'
})
export class AppShellComponent {}
