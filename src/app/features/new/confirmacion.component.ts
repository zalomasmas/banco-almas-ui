import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { WizardService } from './wizard.service';
import { MemoryService } from '../../core/services/memory.service';

@Component({
  selector: 'app-new-confirm',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './confirmacion.component.html',
  styleUrl: './confirmacion.component.scss'
})
export class NewConfirmacionComponent implements OnInit {
  constructor(public wiz: WizardService, private mem: MemoryService, private router: Router) {}
  ngOnInit() {
    this.save();
  }
  save() {
    if (!this.wiz.nodeId) return;
    this.mem.create({
      nodeId: this.wiz.nodeId,
      isPublic: this.wiz.isPublic,
      date: this.wiz.date,
      title: this.wiz.title || 'Nuevo recuerdo',
      text: this.wiz.text || '',
      attachments: this.wiz.attachments
    });
    this.wiz.reset();
  }
  goHome() {
    this.router.navigate(['/app/home']);
  }
}
