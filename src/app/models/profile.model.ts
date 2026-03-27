export interface Profile {
  userId: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'homme' | 'femme' | 'autre';
  lookingFor: 'homme' | 'femme' | 'tous';
  bio: string;
  avatarColor: string;
  interests: string[];
  location: string;
  occupation: string;
  height: number;
  education: string;
  isMock?: boolean;
}
