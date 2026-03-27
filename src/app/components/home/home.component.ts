import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  features = [
    { icon: '&#128274;', title: 'Double Authentification', desc: 'Votre sécurité est notre priorité. Protégez votre compte avec un code TOTP à usage unique.' },
    { icon: '&#10084;', title: 'Matchs Intelligents', desc: 'Notre algorithme trouve des profils compatibles avec vos centres d\'intérêt et préférences.' },
    { icon: '&#128172;', title: 'Chat Sécurisé', desc: 'Échangez en toute confiance avec vos matchs via notre messagerie instantanée sécurisée.' },
    { icon: '&#128064;', title: 'Profils Vérifiés', desc: 'Tous les profils sont contrôlés pour vous offrir une expérience authentique et sûre.' }
  ];

  stats = [
    { value: '50K+', label: 'Membres actifs' },
    { value: '12K+', label: 'Couples formés' },
    { value: '98%', label: 'Satisfaction' }
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/decouvrir']);
    }
  }
}
