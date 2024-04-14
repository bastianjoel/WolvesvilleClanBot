export interface XpEvent {
  id: string;
  clanId: string;
  creatorId: string;
  createdAt: number;
  participants: {
    [key: string]: {
      username: string;
      initialXp: number;
    }
  }
  teams?: {
    [key: string]: {
      name: string;
      members: string[]
    }
  }
}
