import { serverClient } from './supabase';

export async function createUser(
  username: string,
  password_hash: string,
  zipcode?: string,
  school_city?: string,
  school_state?: string
){
  const supa = serverClient();
  const { error } = await supa.from('users').insert({ username, password_hash, zipcode, school_city, school_state });
  if (error) throw error;
}

export async function getUserByUsername(username: string){
  const supa = serverClient();
  const { data, error } = await supa.from('users').select('id, username, password_hash, zipcode, school_city, school_state').eq('username', username).maybeSingle();
  if (error) throw error;
  return data as { id:number, username:string, password_hash:string, zipcode: string | null, school_city: string | null, school_state: string | null } | null;
}

export async function getUserById(id: number){
  const supa = serverClient();
  const { data, error } = await supa.from('users').select('id, username, zipcode, school_city, school_state').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as { id:number, username:string, zipcode: string | null, school_city: string | null, school_state: string | null } | null;
}

export async function getRegistrationRank(userId: number){
  const supa = serverClient();
  const { count, error } = await supa
    .from('users')
    .select('*', { count: 'exact', head: true })
    .lte('id', userId);
  if (error) throw error;
  return count || 0;
}
