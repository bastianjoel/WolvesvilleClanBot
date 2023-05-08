import axios from "axios";
import { DataStore } from "../DataStore";
import { LedgerEntry } from "../models/Ledger";
import { Task } from "./Task";

export class SyncToDB implements Task {
  constructor(private clanId: string) { }

  async run(): Promise<Date> {
    try {
      await this.syncLedger();
      await this.syncMembers();
    } catch (e) {
      console.error(`[ERROR] Failed to sync clan`, e);
    }

    // Sync once per hour
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  private async syncLedger(): Promise<void> {
    const { data } = await axios.get<LedgerEntry[]>(`/clans/${this.clanId}/ledger`);
    const db = await DataStore.getDbConnection();

    for (let entry of data) {
      const { rows } = await db.query(`SELECT EXISTS(SELECT 1 FROM ledger WHERE clan_id = $1 AND data->>'id' = $2)`, [this.clanId, entry.id]);

      if (!rows[0].exists) {
        await db.query(`INSERT INTO public.ledger (clan_id, data) VALUES ($1, $2)`, [this.clanId, entry]);
      }
    }
  }

  private async syncMembers(): Promise<void> {
    const { data } = await axios.get<any[]>(`/clans/${this.clanId}/members`);
    const db = await DataStore.getDbConnection();

    for (let entry of data) {
      const { rows } = await db.query(`SELECT EXISTS(SELECT 1 FROM members WHERE clan_id = $1 AND member_data->>'playerId' = $2)`, [this.clanId, entry.playerId]);

      if (!rows[0].exists) {
        const playerData = (await axios.get<any[]>(`/players/${entry.playerId}`)).data;
        await db.query(`INSERT INTO public.members (clan_id, member_data, player_data) VALUES ($1, $2, $3)`, [this.clanId, entry, playerData]);
      }
    }
  }
}
