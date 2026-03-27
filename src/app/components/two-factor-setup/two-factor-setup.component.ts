import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TwoFactorService } from '../../services/two-factor.service';

@Component({
  selector: 'app-two-factor-setup',
  templateUrl: './two-factor-setup.component.html',
  styleUrls: ['./two-factor-setup.component.css']
})
export class TwoFactorSetupComponent implements OnInit {
  step = 1; // 1: intro, 2: show secret, 3: verify
  secret = '';
  verifyCode = '';
  currentCode = '';
  remainingSeconds = 30;
  error = '';
  loading = false;
  skipped = false;
  private timer: any;

  userEmail = '';

  constructor(
    private authService: AuthService,
    private twoFactorService: TwoFactorService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) { this.router.navigate(['/connexion']); return; }
    this.secret = user.twoFactorSecret;
    this.userEmail = user.email;
    this.updateCode();
    this.startTimer();
  }

  ngOnDestroy() {
    if (this.timer) { clearInterval(this.timer); }
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.remainingSeconds = this.twoFactorService.getRemainingSeconds();
      this.currentCode = this.twoFactorService.generateTOTPCode(this.secret);
    }, 1000);
  }

  updateCode() {
    this.currentCode = this.twoFactorService.generateTOTPCode(this.secret);
    this.remainingSeconds = this.twoFactorService.getRemainingSeconds();
  }

  get secretFormatted(): string {
    return this.secret.match(/.{1,4}/g).join(' ');
  }

  get timerPercent(): number {
    return (this.remainingSeconds / 30) * 100;
  }

  nextStep() { this.step++; this.error = ''; }

  verify() {
    this.error = '';
    if (this.verifyCode.length !== 6) {
      this.error = 'Le code doit contenir 6 chiffres.'; return;
    }
    if (!this.twoFactorService.verifyTOTPCode(this.secret, this.verifyCode)) {
      this.error = 'Code incorrect. Vérifiez votre code et réessayez.'; return;
    }
    this.loading = true;
    const user = this.authService.getCurrentUser();
    this.authService.enableTwoFactor(user.id);
    this.authService.markProfileComplete(user.id);
    setTimeout(() => {
      this.loading = false;
      this.step = 4; // success
    }, 600);
  }

  skip() {
    const user = this.authService.getCurrentUser();
    if (user) { this.authService.markProfileComplete(user.id); }
    this.router.navigate(['/profil']);
  }

  goToApp() {
    this.router.navigate(['/profil']);
  }

  onCodeInput(event: any) {
    this.verifyCode = event.target.value.replace(/\D/g, '').slice(0, 6);
    event.target.value = this.verifyCode;
  }
}
