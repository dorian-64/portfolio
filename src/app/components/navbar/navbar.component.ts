import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user.model';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  currentUser: User | null = null;
  menuOpen = false;

  constructor(public authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUser();
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      this.currentUser = this.authService.getCurrentUser();
      this.menuOpen = false;
    });
  }

  logout() {
    this.authService.logout();
  }

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }
}
