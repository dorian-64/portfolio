import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatchService } from '../../services/match.service';
import { ProfileService } from '../../services/profile.service';
import { Match } from '../../models/message.model';
import { Profile } from '../../models/profile.model';

interface MatchWithProfile {
  match: Match;
  profile: Profile;
}

@Component({
  selector: 'app-matches',
  templateUrl: './matches.component.html',
  styleUrls: ['./matches.component.css']
})
export class MatchesComponent implements OnInit {
  matchesWithProfiles: MatchWithProfile[] = [];
  currentUserId: string;

  constructor(
    private authService: AuthService,
    private matchService: MatchService,
    private profileService: ProfileService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (!user) { return; }
    this.currentUserId = user.id;
    this.loadMatches();
  }

  loadMatches() {
    const matches = this.matchService.getUserMatches(this.currentUserId);
    this.matchesWithProfiles = matches
      .map(match => {
        const otherId = this.matchService.getOtherUserId(match, this.currentUserId);
        const profile = this.profileService.getAllProfiles().find(p => p.userId === otherId);
        if (!profile) { return null; }
        return { match, profile };
      })
      .filter(m => m !== null) as MatchWithProfile[];

    // Sort by last message time
    this.matchesWithProfiles.sort((a, b) => {
      const timeA = a.match.lastMessageTime ? new Date(a.match.lastMessageTime).getTime() : new Date(a.match.createdAt).getTime();
      const timeB = b.match.lastMessageTime ? new Date(b.match.lastMessageTime).getTime() : new Date(b.match.createdAt).getTime();
      return timeB - timeA;
    });
  }

  openChat(matchId: string) {
    this.router.navigate(['/chat', matchId]);
  }

  getInitials(p: Profile): string {
    return (p.firstName.charAt(0) + p.lastName.charAt(0)).toUpperCase();
  }

  getTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) { return 'À l\'instant'; }
    if (mins < 60) { return `Il y a ${mins}min`; }
    const hours = Math.floor(mins / 60);
    if (hours < 24) { return `Il y a ${hours}h`; }
    const days = Math.floor(hours / 24);
    return `Il y a ${days}j`;
  }
}
