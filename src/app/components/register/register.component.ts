import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  step = 1;
  totalSteps = 3;

  // Step 1
  firstName = '';
  lastName = '';
  // Step 2
  email = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  // Step 3
  birthDate = '';
  gender = '';
  lookingFor = '';

  loading = false;
  error = '';

  constructor(private authService: AuthService, private router: Router) {}

  get age(): number {
    if (!this.birthDate) { return 0; }
    const today = new Date();
    const birth = new Date(this.birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) { age--; }
    return age;
  }

  nextStep() {
    this.error = '';
    if (this.step === 1) {
      if (!this.firstName.trim() || !this.lastName.trim()) {
        this.error = 'Veuillez entrer votre prénom et nom.'; return;
      }
    } else if (this.step === 2) {
      if (!this.email || !this.password || !this.confirmPassword) {
        this.error = 'Veuillez remplir tous les champs.'; return;
      }
      if (this.password.length < 8) {
        this.error = 'Le mot de passe doit contenir au moins 8 caractères.'; return;
      }
      if (this.password !== this.confirmPassword) {
        this.error = 'Les mots de passe ne correspondent pas.'; return;
      }
    }
    this.step++;
  }

  prevStep() {
    if (this.step > 1) { this.step--; this.error = ''; }
  }

  onSubmit() {
    this.error = '';
    if (!this.birthDate || !this.gender || !this.lookingFor) {
      this.error = 'Veuillez remplir tous les champs.'; return;
    }
    if (this.age < 18) {
      this.error = 'Vous devez avoir au moins 18 ans.'; return;
    }

    this.loading = true;
    setTimeout(() => {
      const result = this.authService.register(this.email, this.password, this.firstName, this.lastName);
      this.loading = false;
      if (!result.success) {
        this.error = result.error || 'Erreur lors de l\'inscription.'; return;
      }
      // Auto-login
      this.authService.login(this.email, this.password);
      this.router.navigate(['/2fa/configuration']);
    }, 600);
  }

  getStepClass(s: number): string {
    if (s < this.step) { return 'done'; }
    if (s === this.step) { return 'active'; }
    return '';
  }

  getPasswordStrength(): { label: string; color: string; width: string } {
    const p = this.password;
    if (!p) { return { label: '', color: '#e0e0e0', width: '0%' }; }
    let score = 0;
    if (p.length >= 8) { score++; }
    if (p.length >= 12) { score++; }
    if (/[A-Z]/.test(p)) { score++; }
    if (/[0-9]/.test(p)) { score++; }
    if (/[^A-Za-z0-9]/.test(p)) { score++; }
    if (score <= 1) { return { label: 'Faible', color: '#ff4444', width: '20%' }; }
    if (score <= 2) { return { label: 'Moyen', color: '#ff9800', width: '50%' }; }
    if (score <= 3) { return { label: 'Fort', color: '#4caf50', width: '75%' }; }
    return { label: 'Très fort', color: '#2196f3', width: '100%' };
  }
}
