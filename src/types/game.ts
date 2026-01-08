export interface Game {
  id: number;
  name: string;
  author: string;
  nbMinPlayers: number;
  nbMaxPlayers: number;
  type: string;
  ageMin: number;
  editorId: number;
  description: string;
  notice: string;
  prototype: boolean;
  duree: number;
  imageUrl: string;
  videoRulesUrl: string;
}
