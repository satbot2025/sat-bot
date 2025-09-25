import { serverClient } from './supabase';

export type Friend = { id: number; user_id: number; friend_user_id: number; created_at: string; friend: { id:number; username:string } };

export async function listFriends(userId: number): Promise<Friend[]> {
  const supa = serverClient();
  const { data, error } = await supa
    .from('user_friends')
    .select('id, user_id, friend_user_id, created_at, friend:friend_user_id(id, username)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as any;
}

export async function addFriend(userId: number, friendUsername: string){
  const supa = serverClient();
  const { data: friend, error: uErr } = await supa
    .from('users')
    .select('id')
    .eq('username', friendUsername)
    .maybeSingle();
  if (uErr) throw uErr;
  if (!friend) throw new Error('User not found');
  if (friend.id === userId) throw new Error('Cannot add yourself');
  const { error } = await supa
    .from('user_friends')
    .insert({ user_id: userId, friend_user_id: friend.id });
  if (error && !error.message.includes('duplicate')) throw error;
}

export async function deleteFriend(userId: number, friendId: number){
  const supa = serverClient();
  const { error } = await supa
    .from('user_friends')
    .delete()
    .eq('user_id', userId)
    .eq('friend_user_id', friendId);
  if (error) throw error;
}
