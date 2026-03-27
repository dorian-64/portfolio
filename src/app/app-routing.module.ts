import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';

import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { TwoFactorSetupComponent } from './components/two-factor-setup/two-factor-setup.component';
import { TwoFactorVerifyComponent } from './components/two-factor-verify/two-factor-verify.component';
import { DiscoverComponent } from './components/discover/discover.component';
import { MatchesComponent } from './components/matches/matches.component';
import { ChatComponent } from './components/chat/chat.component';
import { ProfileComponent } from './components/profile/profile.component';
import { SettingsComponent } from './components/settings/settings.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'connexion', component: LoginComponent },
  { path: 'inscription', component: RegisterComponent },
  { path: '2fa/configuration', component: TwoFactorSetupComponent, canActivate: [AuthGuard] },
  { path: '2fa/verification', component: TwoFactorVerifyComponent },
  { path: 'decouvrir', component: DiscoverComponent, canActivate: [AuthGuard] },
  { path: 'matchs', component: MatchesComponent, canActivate: [AuthGuard] },
  { path: 'chat/:id', component: ChatComponent, canActivate: [AuthGuard] },
  { path: 'profil', component: ProfileComponent, canActivate: [AuthGuard] },
  { path: 'parametres', component: SettingsComponent, canActivate: [AuthGuard] },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
