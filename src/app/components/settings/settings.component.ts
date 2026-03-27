import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TwoFactorService } from '../../services/two-factor.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
  user: User | null = null;

  // 2FA section
  showTwoFASection = false;
  twoFAStep: 'info' | 'setup' | 'verify-enable' | 'verify-disable' | 'done' = 'info';
  twoFACode = '';
  twoFAError = '';
  currentCode = '';
  remainingSeconds = 30;
  private timer: any;

  // Password section
  showPasswordSection = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  passwordSuccess = '';
  showPasswords = false;

  // Danger zone
  showDeleteConfirm = false;
  deleteConfirmText = '';

  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
    private router: Router
  ) {}

  ngOnInit() {
    this.user = this.authService.getCurrentUser();
    if (!this.user) { this.router.navigate(['/connexion']); return; }
    this.updateCode();
    this.timer = setInterval(() => {
      this.remainingSeconds = this.twoFactorService.getRemainingSeconds();
      this.currentCode = this.twoFactorService.generateTOTPCode(this.user.twoFactorSecret);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) { clearInterval(this.timer); }
  }

  updateCode() {
    this.currentCode = this.twoFactorService.generateTOTPCode(this.user.twoFactorSecret);
    this.remainingSeconds = this.twoFactorService.getRemainingSeconds();
  }

  get timerPercent(): number {
    return (this.remainingSeconds / 30) * 100;
  }

  toggleTwoFA() {
    this.showTwoFASection = !this.showTwoFASection;
    this.twoFAStep = 'info';
    this.twoFACode = '';
    this.twoFAError = '';
  }

  initTwoFAChange() {
    if (this.user.twoFactorEnabled) {
      this.twoFAStep = 'verify-disable';
    } else {
      this.twoFAStep = 'setup';
    }
    this.twoFACode = '';
    this.twoFAError = '';
  }

  onTwoFACodeInput(event: any) {
    this.twoFACode = event.target.value.replace(/\D/g, '').slice(0, 6);
    event.target.value = this.twoFACode;
  }

  confirmTwoFA() {
    this.twoFAError = '';
    if (this.twoFACode.length !== 6) { this.twoFAError = 'Entrez un code à 6 chiffres.'; return; }
    if (!this.twoFactorService.verifyTOTPCode(this.user.twoFactorSecret, this.twoFACode)) {
      this.twoFAError = 'Code incorrect. Réessayez.'; return;
    }
    if (this.twoFAStep === 'verify-enable' || this.twoFAStep === 'setup') {
      this.authService.enableTwoFactor(this.user.id);
    } else {
      this.authService.disableTwoFactor(this.user.id);
    }
    this.authService.refreshCurrentUser();
    this.user = this.authService.getCurrentUser();
    this.twoFAStep = 'done';
  }

  changePassword() {
    this.passwordError = '';
    this.passwordSuccess = '';
    if (!this.currentPassword || !this.newPassword || !this.confirmPassword) {
      this.passwordError = 'Veuillez remplir tous les champs.'; return;
    }
    const users = this.authService.getUsers();
    const u = users.find(x => x.id === this.user.id);
    // Simple hash check
    const hashFn = (s: string) => {
      let h = 0;
      for (let i = 0; i < s.length; i++) { h = ((h << 5) - h) + s.charCodeAt(i); h |= 0; }
      return Math.abs(h).toString(16);
    };
    if (u.passwordHash !== hashFn(this.currentPassword)) {
      this.passwordError = 'Mot de passe actuel incorrect.'; return;
    }
    if (this.newPassword.length < 8) {
      this.passwordError = 'Le nouveau mot de passe doit avoir au moins 8 caractères.'; return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'Les mots de passe ne correspondent pas.'; return;
    }
    this.authService.updatePassword(this.user.id, this.newPassword);
    this.passwordSuccess = 'Mot de passe modifié avec succès !';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    setTimeout(() => { this.passwordSuccess = ''; this.showPasswordSection = false; }, 3000);
  }

  get secretFormatted(): string {
    if (!this.user || !this.user.twoFactorSecret) { return ''; }
    return this.user.twoFactorSecret.match(/.{1,4}/g).join(' ');
  }

  logout() {
    this.authService.logout();
  }
}
