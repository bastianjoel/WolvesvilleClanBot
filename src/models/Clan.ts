export interface Clan {
  id: string;
  creationTime: string; // TODO: Date
  name: string;
  description: string;
  xp: number;
  language: string;
  icon: string;
  iconColor: string; // TODO: Color
  tag: string;
  joinType: string; // TODO: enum
  leaderId: string; // TODO: PlayerID
  questHistoryCount: number;
  minLevel: number;
  memberCount: number;
}
