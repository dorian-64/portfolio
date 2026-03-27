import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { Profile } from '../../models/profile.model';

const ALL_INTERESTS = [
  'Voyage', 'Photographie', 'Yoga', 'Cuisine', 'Musique', 'Randonnée',
  'Cinéma', 'Lecture', 'Sport', 'Art', 'Danse', 'Nature', 'Animaux',
  'Méditation', 'Surf', 'Montagne', 'Gastronomie', 'Tech', 'Jeux vidéo',
  'Théâtre', 'Écriture', 'Podcasts', 'Café', 'Vin', 'Jazz', 'Rock',
];

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  profile: Profile;
  editing = false;
  saved = false;
  allInterests = ALL_INTERESTS;
  error = '';

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) { this.router.navigate(['/connexion']); return; }

    const existing = this.profileService.getProfile(user.id);
    if (existing) {
      this.profile = { ...existing };
    } else {
      this.profile = {
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        age: 25,
        gender: 'homme',
        lookingFor: 'femme',
        bio: '',
        avatarColor: this.profileService.generateAvatarColor(user.firstName + user.lastName),
        interests: [],
        location: '',
        occupation: '',
        height: 170,
        education: ''
      };
      this.editing = true;
    }
  }

  get initials(): string {
    return this.profileService.getInitials(this.profile.firstName, this.profile.lastName);
  }

  toggleEdit() {
    this.editing = !this.editing;
    this.saved = false;
    this.error = '';
  }

  toggleInterest(interest: string) {
    const idx = this.profile.interests.indexOf(interest);
    if (idx !== -1) {
      this.profile.interests.splice(idx, 1);
    } else if (this.profile.interests.length < 8) {
      this.profile.interests.push(interest);
    }
  }

  isSelected(interest: string): boolean {
    return this.profile.interests.includes(interest);
  }

  save() {
    this.error = '';
    if (!this.profile.bio.trim()) { this.error = 'Veuillez écrire une courte bio.'; return; }
    if (!this.profile.location.trim()) { this.error = 'Veuillez indiquer votre ville.'; return; }
    if (this.profile.interests.length < 1) { this.error = 'Sélectionnez au moins un intérêt.'; return; }

    this.profileService.saveProfile(this.profile);
    const user = this.authService.getCurrentUser();
    this.authService.markProfileComplete(user.id);
    this.editing = false;
    this.saved = true;
    setTimeout(() => this.saved = false, 3000);
  }
}
