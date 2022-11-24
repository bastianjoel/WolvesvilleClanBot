import axios from "axios";
import * as questActiveResponse from "../../fixtures/clans.0.quests.active.json";
import { CheckQuestXpContributions } from "./CheckQuestXpContributions";

jest.mock(`axios`);
const mockedAxios = axios as jest.Mocked<typeof axios>;

test('reports player with insufficient quest xp', async () => {
  mockedAxios.get.mockResolvedValueOnce({ data: questActiveResponse });
  mockedAxios.post.mockResolvedValueOnce(null);
  const checker = new CheckQuestXpContributions('0');
  const rerunTime = await checker.run();

  expect(rerunTime.valueOf()).toBe(Date.parse("2022-09-28T09:39:34.192Z"))
  expect(mockedAxios.post).toHaveBeenCalledTimes(1);
  expect(mockedAxios.post).toHaveBeenCalledWith(`/clans/0/chat`, {
    message: `User 2 macht zu wenig Quest XP.`
  });
});
