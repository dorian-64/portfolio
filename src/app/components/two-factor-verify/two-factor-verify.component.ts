import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TwoFactorService } from '../../services/two-factor.service';

@Component({
  selector: 'app-two-factor-verify',
  templateUrl: './two-factor-verify.component.html',
  styleUrls: ['./two-factor-verify.component.css']
})
export class TwoFactorVerifyComponent implements OnInit, OnDestroy {
  code = '';
  error = '';
  loading = false;
  remainingSeconds = 30;
  attempts = 0;
  maxAttempts = 5;
  currentCode = '';
  private timer: any;
  private secret = '';

  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
    private router: Router
  ) {}

  ngOnInit() {
    const pendingId = this.authService.getPending2FAUserId();
    if (!pendingId) {
      this.router.navigate(['/connexion']); return;
    }
    const users = this.authService.getUsers();
    const user = users.find(u => u.id === pendingId);
    if (!user) { this.router.navigate(['/connexion']); return; }
    this.secret = user.twoFactorSecret;
    this.updateCode();
    this.timer = setInterval(() => {
      this.remainingSeconds = this.twoFactorService.getRemainingSeconds();
      this.currentCode = this.twoFactorService.generateTOTPCode(this.secret);
    }, 1000);
  }

  ngOnDestroy() {
    if (this.timer) { clearInterval(this.timer); }
  }

  updateCode() {
    this.currentCode = this.twoFactorService.generateTOTPCode(this.secret);
    this.remainingSeconds = this.twoFactorService.getRemainingSeconds();
  }

  get timerPercent(): number {
    return (this.remainingSeconds / 30) * 100;
  }

  onCodeInput(event: any) {
    this.code = event.target.value.replace(/\D/g, '').slice(0, 6);
    event.target.value = this.code;
    if (this.code.length === 6) { this.verify(); }
  }

  verify() {
    if (this.loading || this.code.length !== 6) { return; }
    this.error = '';
    this.loading = true;
    this.attempts++;

    setTimeout(() => {
      const result = this.authService.verifyTwoFactor(this.code);
      this.loading = false;
      if (!result.success) {
        this.code = '';
        this.error = result.error || 'Code invalide.';
        if (this.attempts >= this.maxAttempts) {
          this.error = 'Trop de tentatives. Veuillez vous reconnecter.';
          setTimeout(() => this.router.navigate(['/connexion']), 2000);
        }
        return;
      }
      const user = this.authService.getCurrentUser();
      this.router.navigate(user && user.isProfileComplete ? ['/decouvrir'] : ['/profil']);
    }, 600);
  }

  goBack() {
    this.router.navigate(['/connexion']);
  }
}
