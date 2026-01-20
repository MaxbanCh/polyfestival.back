export interface User {
  id: number;
  login: string;
  role: string;
  validated: boolean;
}

export interface PublicUser {
  id: number;
  login: string;
  role: string;
  validated: boolean;
  permissions: string[];
}

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ORGANISATEUR = 'super-organisateur',
  ORGANISATEUR = 'organisateur',
  BENEVOLE = 'benevole',
  EDITEUR = 'editeur',
  NON_VALIDE = 'non-valide',
}