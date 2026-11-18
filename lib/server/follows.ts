// Following: who follows whom. As on read.cv, follower lists are private:
// only the person themselves can see who follows them and whom they follow,
// and profiles show no counts.

import sql from './db';
import { normalizeUsername } from '../validation/username';

const LIST_LIMIT = 200;

export interface FollowPerson {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  followedAt: Date;
  /** Whether the signed-in user follows this person. */
  youFollow: boolean;
}

export interface FollowOverview {
  /** People who follow you, newest first. */
  followers: FollowPerson[];
  /** People you follow, newest first. */
  following: FollowPerson[];
}

export type FollowResult =
  | { ok: true; following: boolean }
  | { ok: false; reason: 'not_found' | 'self' | 'unavailable' };

/** Follows or unfollows someone by username. Following twice is harmless. */
export async function setFollowing(
  userId: string,
  username: string,
  follow: boolean,
): Promise<FollowResult> {
  const [target] = await sql`
    SELECT id FROM users WHERE username = ${normalizeUsername(username)}
  `;
  if (!target) return { ok: false, reason: 'not_found' };
  const targetId = target.id as string;
  if (targetId === userId) return { ok: false, reason: 'self' };

  if (!follow) {
    await sql`
      DELETE FROM follows
      WHERE follower_id = ${userId} AND followee_id = ${targetId}
    `;
    return { ok: true, following: false };
  }

  // A block in either direction stops following. The message doesn't say
  // which, so a block is never revealed.
  const [block] = await sql`
    SELECT 1 FROM user_blocks
    WHERE (blocker_id = ${userId} AND blocked_id = ${targetId})
       OR (blocker_id = ${targetId} AND blocked_id = ${userId})
    LIMIT 1
  `;
  if (block) return { ok: false, reason: 'unavailable' };

  await sql`
    INSERT INTO follows (follower_id, followee_id)
    VALUES (${userId}, ${targetId})
    ON CONFLICT DO NOTHING
  `;
  return { ok: true, following: true };
}

/** Does `followerId` follow `followeeId`? */
export async function isFollowing(
  followerId: string,
  followeeId: string,
): Promise<boolean> {
  if (followerId === followeeId) return false;
  const [row] = await sql`
    SELECT 1 FROM follows
    WHERE follower_id = ${followerId} AND followee_id = ${followeeId}
  `;
  return !!row;
}

type Row = {
  id: string;
  username: string;
  name: string | null;
  image: string | null;
  followedAt: Date;
  youFollow: boolean;
};

/** Both of your lists, for the Following page and its "See all" view. */
export async function getFollowOverview(
  userId: string,
): Promise<FollowOverview> {
  const [followers, following] = await Promise.all([
    sql`
      SELECT u.id, u.username, u.name,
             COALESCE(u.custom_image, u.image) AS image,
             f.created_at AS followed_at,
             EXISTS (
               SELECT 1 FROM follows mine
               WHERE mine.follower_id = ${userId} AND mine.followee_id = u.id
             ) AS you_follow
      FROM follows f
      JOIN users u ON u.id = f.follower_id
      WHERE f.followee_id = ${userId} AND u.username IS NOT NULL
      ORDER BY f.created_at DESC
      LIMIT ${LIST_LIMIT}
    `,
    sql`
      SELECT u.id, u.username, u.name,
             COALESCE(u.custom_image, u.image) AS image,
             f.created_at AS followed_at,
             TRUE AS you_follow
      FROM follows f
      JOIN users u ON u.id = f.followee_id
      WHERE f.follower_id = ${userId} AND u.username IS NOT NULL
      ORDER BY f.created_at DESC
      LIMIT ${LIST_LIMIT}
    `,
  ]);
  return {
    followers: followers as unknown as Row[],
    following: following as unknown as Row[],
  };
}

/** New followers since you last opened the Following page. */
export async function countNewFollowers(userId: string): Promise<number> {
  const [row] = await sql`
    SELECT COUNT(*)::int AS count
    FROM follows f
    JOIN users me ON me.id = ${userId}
    WHERE f.followee_id = ${userId}
      AND (me.following_seen_at IS NULL OR f.created_at > me.following_seen_at)
  `;
  return (row?.count as number) ?? 0;
}

export async function markFollowersSeen(userId: string): Promise<void> {
  await sql`UPDATE users SET following_seen_at = NOW() WHERE id = ${userId}`;
}
