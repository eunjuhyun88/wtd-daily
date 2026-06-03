import { query } from '$lib/server/db';

const MAX_STORED_TURNS = 20;

export interface ConversationTurn {
  role: 'user' | 'assistant';
  content: string;
}

export async function loadConversationHistory(
  userId: string,
  symbol: string,
): Promise<ConversationTurn[]> {
  try {
    const result = await query<{ turns: ConversationTurn[] }>(
      `SELECT turns FROM agent_conversations WHERE user_id = $1 AND symbol = $2`,
      [userId, symbol],
    );
    return result.rows[0]?.turns ?? [];
  } catch {
    return [];
  }
}

export async function saveConversationHistory(
  userId: string,
  symbol: string,
  turns: ConversationTurn[],
): Promise<void> {
  const trimmed = turns.slice(-MAX_STORED_TURNS);
  await query(
    `INSERT INTO agent_conversations (user_id, symbol, turns, updated_at)
     VALUES ($1, $2, $3, now())
     ON CONFLICT (user_id, symbol)
     DO UPDATE SET turns = $3, updated_at = now()`,
    [userId, symbol, JSON.stringify(trimmed)],
  );
}
