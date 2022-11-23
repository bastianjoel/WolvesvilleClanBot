export interface LedgerEntry {
  readonly id: string;
  readonly gold: number;
  readonly gems: number;
  readonly playerUsername: string;
  readonly clanQuestId: string;
  readonly type: 'CREATE_CLAN' | 'DONATE' | 'CLAN_QUEST' | 'CLAN_ICON' | 'CLAN_QUEST_SHUFFLE' | 'CLAN_QUEST_SKIP_WAIT' | 'CLAN_QUEST_CLAIM_TIME';
  readonly creationTime: string; // TODO: Date
}
