export interface Quest {
  readonly quest: QuestInfo;
  readonly xp: number;
  readonly xpPerReward: number;
  readonly tier: number;
  readonly tierStartTime: string; // TODO: Date
  readonly tierEndTime: string; // TODO: Date
  readonly tierFinished: boolean; // TODO: Date
  readonly participants: QuestParticipant[];
  readonly claimedTime: boolean; // TODO: Date
}

export interface QuestParticipant {
  readonly playerId: string;
  readonly username: string;
  readonly xp: number;
}

export interface QuestInfo {
  readonly id: string;
  readonly rewards: QuestReward[];
  readonly promoImageUrl: string;
  readonly promoImagePrimaryColor: string; // TODO: Color
  readonly purchasableWithGems: boolean;
}

export interface QuestReward {
  readonly type: string;
  readonly amount: number;
  readonly avatarItemId: string;
  readonly displayType: string; // TODO: Looks like enum
}
