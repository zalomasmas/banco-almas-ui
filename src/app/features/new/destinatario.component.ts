import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { WizardService } from './wizard.service';

@Component({
  selector: 'app-new-dest',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './destinatario.component.html',
  styleUrl: './destinatario.component.scss'
})
export class NewDestinatarioComponent {
  constructor(public wiz: WizardService, private router: Router) {}
  set(id: string) {
    this.wiz.nodeId = id;
    this.router.navigate(['/app/nuevo/privacidad-fecha']);
  }
}
