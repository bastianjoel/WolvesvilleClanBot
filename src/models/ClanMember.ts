export interface ClanMember {
  playerId: string;
  creationTime: string; // Date
  xp: number;
  status: string; // Enum
  isCoLeader: boolean;
  username: string;
  level: number;
  lastOnline: string; // Date
  profileIconId: string;
  profileIconColor: string;
  playerStatus: string; // Enum
  participateInClanQuests: boolean;
}
