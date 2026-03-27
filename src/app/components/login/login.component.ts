import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  email = '';
  password = '';
  showPassword = false;
  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (!this.email || !this.password) {
      this.error = 'Veuillez remplir tous les champs.';
      return;
    }
    this.loading = true;
    this.error = '';

    setTimeout(() => {
      const result = this.authService.login(this.email, this.password);
      this.loading = false;
      if (!result.success) {
        this.error = result.error || 'Erreur de connexion.';
        return;
      }
      if (result.requiresTwoFactor) {
        this.router.navigate(['/2fa/verification']);
      } else {
        const user = this.authService.getCurrentUser();
        this.router.navigate(user && user.isProfileComplete ? ['/decouvrir'] : ['/profil']);
      }
    }, 600);
  }
}
