import { serverClient } from './supabase';

export type PracticeTest = { id: number; title: string; description: string | null };

export async function listTests(): Promise<PracticeTest[]>{
  const supa = serverClient();
  const { data, error } = await supa.from('practice_tests').select('id, title, description').order('id');
  if (error) throw error;
  return data as PracticeTest[];
}

export async function createAttempt(userId: number, testId: number){
  const supa = serverClient();
  const { error } = await supa.from('practice_attempts').insert({ user_id: userId, test_id: testId });
  if (error) throw error;
}

export async function getAttemptCount(userId: number){
  const supa = serverClient();
  const { count, error } = await supa.from('practice_attempts').select('*', { count: 'exact', head: true }).eq('user_id', userId);
  if (error) throw error;
  return count || 0;
}
