import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ProfileService } from '../../services/profile.service';
import { MatchService } from '../../services/match.service';
import { Profile } from '../../models/profile.model';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.component.html',
  styleUrls: ['./discover.component.css']
})
export class DiscoverComponent implements OnInit {
  profiles: Profile[] = [];
  currentIndex = 0;
  showMatch = false;
  matchedProfile: Profile | null = null;
  noMoreProfiles = false;
  swipeDirection: 'left' | 'right' | null = null;
  loading = false;

  constructor(
    private authService: AuthService,
    private profileService: ProfileService,
    private matchService: MatchService
  ) {}

  ngOnInit() {
    this.loadProfiles();
  }

  loadProfiles() {
    const user = this.authService.getCurrentUser();
    if (!user) { return; }
    const seenIds = this.matchService.getSeenIds(user.id);
    this.profiles = this.profileService.getDiscoverProfiles(user.id, seenIds);
    this.currentIndex = 0;
    if (this.profiles.length === 0) { this.noMoreProfiles = true; }
  }

  get currentProfile(): Profile | null {
    return this.profiles[this.currentIndex] || null;
  }

  get nextProfile(): Profile | null {
    return this.profiles[this.currentIndex + 1] || null;
  }

  like() {
    if (!this.currentProfile || this.loading) { return; }
    this.swipeDirection = 'right';
    this.loading = true;

    const user = this.authService.getCurrentUser();
    const result = this.matchService.like(user.id, this.currentProfile.userId);

    setTimeout(() => {
      if (result.isMatch) {
        this.matchedProfile = this.currentProfile;
        this.showMatch = true;
      }
      this.advanceCard();
      this.loading = false;
    }, 400);
  }

  dislike() {
    if (!this.currentProfile || this.loading) { return; }
    this.swipeDirection = 'left';
    this.loading = true;

    const user = this.authService.getCurrentUser();
    this.matchService.dislike(user.id, this.currentProfile.userId);

    setTimeout(() => {
      this.advanceCard();
      this.loading = false;
    }, 400);
  }

  private advanceCard() {
    this.currentIndex++;
    this.swipeDirection = null;
    if (this.currentIndex >= this.profiles.length) {
      this.noMoreProfiles = true;
    }
  }

  closeMatch() {
    this.showMatch = false;
    this.matchedProfile = null;
  }

  getInitials(p: Profile): string {
    return (p.firstName.charAt(0) + p.lastName.charAt(0)).toUpperCase();
  }

  reload() {
    this.noMoreProfiles = false;
    this.loadProfiles();
  }
}
