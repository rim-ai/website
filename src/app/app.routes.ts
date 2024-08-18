import { Routes } from '@angular/router';
import { MainComponent } from './main_component/main_component';
import { ChallengeComponent } from './challenge/challenge.component';
import { SubmissionComponent } from './submission/submission.component';

export const routes: Routes = [
    { 
        path: '', 
        loadComponent: () => import('./main_component/main_component').then(c => c.MainComponent)
    },
    { 
        path: 'challenge', 
        loadComponent: () => import('./challenge/challenge.component').then(c => c.ChallengeComponent)
    },
    { 
        path: 'submission', 
        loadComponent: () => import('./submission/submission.component').then(c => c.SubmissionComponent)
    }

];