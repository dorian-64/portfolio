import { Injectable } from '@angular/core';
import { Profile } from '../models/profile.model';

const MOCK_PROFILES: Profile[] = [
  {
    userId: 'mock1', firstName: 'Sophie', lastName: 'Martin', age: 26,
    gender: 'femme', lookingFor: 'homme', bio: 'Passionnée de voyages et de photographie. J\'adore explorer de nouveaux endroits et rencontrer des personnes intéressantes.',
    avatarColor: '#e91e8c', interests: ['Voyage', 'Photographie', 'Yoga', 'Cuisine'], location: 'Paris', occupation: 'Graphiste', height: 165, education: 'Master Design', isMock: true
  },
  {
    userId: 'mock2', firstName: 'Lucas', lastName: 'Dubois', age: 29,
    gender: 'homme', lookingFor: 'femme', bio: 'Développeur le jour, guitariste la nuit. Je cherche quelqu\'un avec qui partager ma passion pour la musique.',
    avatarColor: '#3f51b5', interests: ['Musique', 'Randonnée', 'Cinéma', 'Tech'], location: 'Lyon', occupation: 'Développeur', height: 182, education: 'École d\'ingénieurs', isMock: true
  },
  {
    userId: 'mock3', firstName: 'Emma', lastName: 'Bernard', age: 24,
    gender: 'femme', lookingFor: 'tous', bio: 'Amoureuse de la nature et des animaux. Végétarienne convaincue, je cherche quelqu\'un de bienveillant.',
    avatarColor: '#4caf50', interests: ['Nature', 'Animaux', 'Lecture', 'Méditation'], location: 'Bordeaux', occupation: 'Vétérinaire', height: 168, education: 'Doctorat Vétérinaire', isMock: true
  },
  {
    userId: 'mock4', firstName: 'Thomas', lastName: 'Petit', age: 32,
    gender: 'homme', lookingFor: 'femme', bio: 'Chef cuisinier passionné. J\'adore faire découvrir mes créations culinaires. La gastronomie, c\'est ma vie.',
    avatarColor: '#ff5722', interests: ['Cuisine', 'Gastronomie', 'Vin', 'Voyages'], location: 'Marseille', occupation: 'Chef cuisinier', height: 178, education: 'École hôtelière', isMock: true
  },
  {
    userId: 'mock5', firstName: 'Chloé', lastName: 'Leroy', age: 27,
    gender: 'femme', lookingFor: 'homme', bio: 'Avocate dans la journée, danseuse le week-end ! Je cherche quelqu\'un d\'ambitieux et d\'aventurier.',
    avatarColor: '#9c27b0', interests: ['Danse', 'Sport', 'Droit', 'Culture'], location: 'Toulouse', occupation: 'Avocate', height: 170, education: 'Master Droit', isMock: true
  },
  {
    userId: 'mock6', firstName: 'Antoine', lastName: 'Moreau', age: 30,
    gender: 'homme', lookingFor: 'femme', bio: 'Architecte passionné par l\'urbanisme durable. Week-ends montagne ou mer selon la saison.',
    avatarColor: '#00bcd4', interests: ['Architecture', 'Montagne', 'Surf', 'Art'], location: 'Nantes', occupation: 'Architecte', height: 185, education: 'École d\'Architecture', isMock: true
  },
  {
    userId: 'mock7', firstName: 'Léa', lastName: 'Fontaine', age: 25,
    gender: 'femme', lookingFor: 'homme', bio: 'Journaliste curieuse du monde. Toujours un carnet et un stylo à la main. Cherche quelqu\'un avec des histoires à raconter.',
    avatarColor: '#f44336', interests: ['Écriture', 'Politique', 'Cinéma', 'Café'], location: 'Paris', occupation: 'Journaliste', height: 163, education: 'Sciences Po', isMock: true
  },
  {
    userId: 'mock8', firstName: 'Maxime', lastName: 'Simon', age: 28,
    gender: 'homme', lookingFor: 'femme', bio: 'Médecin urgentiste. La vie m\'a appris à apprécier chaque moment. Je cherche une relation vraie et profonde.',
    avatarColor: '#009688', interests: ['Sport', 'Médecine', 'Philosophie', 'Jazz'], location: 'Strasbourg', occupation: 'Médecin', height: 180, education: 'Doctorat Médecine', isMock: true
  },
  {
    userId: 'mock9', firstName: 'Camille', lastName: 'Rousseau', age: 31,
    gender: 'femme', lookingFor: 'tous', bio: 'Illustratrice freelance avec une âme de voyageuse. Mon appartement ressemble à une galerie d\'art.',
    avatarColor: '#ff9800', interests: ['Art', 'Illustration', 'Voyage', 'Manga'], location: 'Paris', occupation: 'Illustratrice', height: 167, education: 'Beaux-Arts', isMock: true
  },
  {
    userId: 'mock10', firstName: 'Nicolas', lastName: 'Laurent', age: 35,
    gender: 'homme', lookingFor: 'femme', bio: 'Entrepreneur dans la tech. Passionné de voile et de kitesurf. Je cherche quelqu\'un qui aime vivre à 100%.',
    avatarColor: '#607d8b', interests: ['Voile', 'Kitesurf', 'Startup', 'Podcasts'], location: 'Biarritz', occupation: 'Entrepreneur', height: 183, education: 'HEC', isMock: true
  }
];

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private readonly PROFILES_KEY = 'heartsync_profiles';

  private getProfiles(): Profile[] {
    const data = localStorage.getItem(this.PROFILES_KEY);
    return data ? JSON.parse(data) : [];
  }

  private saveProfiles(profiles: Profile[]): void {
    localStorage.setItem(this.PROFILES_KEY, JSON.stringify(profiles));
  }

  getProfile(userId: string): Profile | null {
    const profiles = this.getProfiles();
    return profiles.find(p => p.userId === userId) || null;
  }

  saveProfile(profile: Profile): void {
    const profiles = this.getProfiles();
    const idx = profiles.findIndex(p => p.userId === profile.userId);
    if (idx !== -1) {
      profiles[idx] = profile;
    } else {
      profiles.push(profile);
    }
    this.saveProfiles(profiles);
  }

  getMockProfiles(): Profile[] {
    return MOCK_PROFILES;
  }

  getAllProfiles(): Profile[] {
    const real = this.getProfiles();
    return [...real, ...MOCK_PROFILES];
  }

  getDiscoverProfiles(currentUserId: string, seenIds: string[]): Profile[] {
    return this.getAllProfiles().filter(p =>
      p.userId !== currentUserId && !seenIds.includes(p.userId)
    );
  }

  generateAvatarColor(name: string): string {
    const colors = ['#e91e8c', '#3f51b5', '#4caf50', '#ff5722', '#9c27b0', '#00bcd4', '#f44336', '#009688', '#ff9800', '#607d8b'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  getInitials(firstName: string, lastName: string): string {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  }
}
