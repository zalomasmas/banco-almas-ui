import { Routes } from '@angular/router';
import { AppShellComponent } from './app-shell.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { HomeComponent } from './home.component';
import { MemoriesNodesComponent } from '../memories/nodes.component';
import { MemoriesCalendarComponent } from '../memories/calendar.component';
import { MemoryDetailComponent } from '../memories/detail.component';
import { NewDestinatarioComponent } from '../new/destinatario.component';
import { NewPrivacidadFechaComponent } from '../new/privacidad-fecha.component';
import { NewEditorComponent } from '../new/editor.component';
import { NewConfirmacionComponent } from '../new/confirmacion.component';
import { ReflectionQuestionsComponent } from '../reflection/questions.component';
import { ReflectionRespondComponent } from '../reflection/respond.component';
import { ChatComponent } from '../chatbot/chat.component';
import { LegacyConfigComponent } from '../legacy/config.component';
import { SettingsComponent } from './settings.component';

export const routes: Routes = [
  {
    path: '',
    component: AppShellComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'recuerdos/nodos', component: MemoriesNodesComponent },
      { path: 'recuerdos/calendario', component: MemoriesCalendarComponent },
      { path: 'recuerdos/:id', component: MemoryDetailComponent },
      { path: 'nuevo/destinatario', component: NewDestinatarioComponent },
      { path: 'nuevo/privacidad-fecha', component: NewPrivacidadFechaComponent },
      { path: 'nuevo/editor', component: NewEditorComponent },
      { path: 'nuevo/confirmacion', component: NewConfirmacionComponent },
      { path: 'estado-del-alma/preguntas', component: ReflectionQuestionsComponent },
      { path: 'estado-del-alma/responder/:questionId', component: ReflectionRespondComponent },
      { path: 'chatbot/chat', component: ChatComponent },
      { path: 'legado/config', component: LegacyConfigComponent },
      { path: 'ajustes', component: SettingsComponent },
      { path: '', pathMatch: 'full', redirectTo: 'home' }
    ]
  }
];
