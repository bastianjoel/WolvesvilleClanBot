export interface Player {
  id: string;
  username: string;
  personalMessage: string;
  level: number;
  status: string;
  lastOnline: string;
  rankedSeasonSkill: string;
  rankedSeasonMaxSkill: number;
  rankedSeasonBestRank: number;
  rankedSeasonPlayedCount: number;
  receivedRosesCount: number;
  sentRosesCount: number;
  profileIconId: string;
  profileIconColor: string;
  equippedAvatar: {
    url: string;
    width: number;
    height: number;
  };
  avatars: [
    {
      url: string;
      width: number;
      height: number;
      sharedAvatarId: string;
    },
  ];
  badgeIds: [];
  roleCards: [];
  clanId: string;
  gameStats: {
    totalWinCount: number;
    totalLoseCount: number;
    totalTieCount: number;
    villageWinCount: number;
    villageLoseCount: number;
    werewolfWinCount: number;
    werewolfLoseCount: number;
    votingWinCount: number;
    votingLoseCount: number;
    soloWinCount: number;
    soloLoseCount: number;
    exitGameBySuicideCount: number;
    exitGameAfterDeathCount: number;
    gamesSurvivedCount: number;
    gamesKilledCount: number;
    totalPlayTimeInMinutes: number;
    achievements: [
      {
        roleId: string;
        level: number;
        points: number;
        pointsNextLevel: number;
        category: string;
      },
    ];
  };
}
