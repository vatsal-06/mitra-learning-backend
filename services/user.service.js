import { users, userStats } from "../db/store.js";

export function createOrGetUser(userId, language, profession) {
  if (!users.has(userId)) {
    users.set(userId, {
      user_id: userId,
      language,
      profession,
      created_at: new Date(),
    });

    userStats.set(userId, {
      xp: 0,
      streak: 0,
      last_active_date: null,
    });
  }

  return {
    user: users.get(userId),
    stats: userStats.get(userId),
  };
}
