import { serverClient } from './supabase';

export type PracticeTest = { id: number; title: string; description: string | null };
export type PracticeSection = { id: number; test_id: number; title: string; order_index: number; time_limit_minutes: number | null };
export type PracticeQuestion = {
  id: number;
  section_id: number;
  order_index: number;
  type: 'single_choice' | 'multi_choice' | 'free_response';
  prompt: string;
  explanation: string | null;
  correct_answer: any; // internal use only; don’t expose to client in production
  difficulty: string | null;
};

export type PracticeAttempt = {
  id: number;
  user_id: number;
  test_id: number;
  started_at: string;
  completed_at: string | null;
  score_raw: number | null;
  score_max: number | null;
  percent: number | null;
};

export type PracticeResponse = {
  id: number;
  attempt_id: number;
  question_id: number;
  answered_at: string;
  answer: any;
  is_correct: boolean | null;
  score: number | null;
  max_score: number;
};

export async function listTests(): Promise<PracticeTest[]>{
  const supa = serverClient();
  const { data, error } = await supa.from('practice_tests').select('id, title, description').order('id');
  if (error) throw error;
  return data as PracticeTest[];
}

export async function listSections(testId: number): Promise<PracticeSection[]> {
  const supa = serverClient();
  const { data, error } = await supa.from('practice_sections').select('*').eq('test_id', testId).order('order_index');
  if (error) throw error;
  return data as PracticeSection[];
}

export async function listQuestions(sectionId: number): Promise<PracticeQuestion[]> {
  const supa = serverClient();
  // Do NOT select correct_answer in a real client-side query visible to user; keep here for scoring (server only)
  const { data, error } = await supa.from('practice_questions').select('*').eq('section_id', sectionId).order('order_index');
  if (error) throw error;
  return data as PracticeQuestion[];
}

export async function createAttempt(userId: number, testId: number){
  const supa = serverClient();
  const { data, error } = await supa.from('practice_attempts').insert({ user_id: userId, test_id: testId }).select('id').single();
  if (error) throw error;
  return data.id as number;
}

export async function getAttempt(attemptId: number): Promise<PracticeAttempt | null>{
  const supa = serverClient();
  const { data, error } = await supa.from('practice_attempts').select('*').eq('id', attemptId).maybeSingle();
  if (error) throw error;
  return data as PracticeAttempt | null;
}

export async function getAttemptCount(userId: number){
  const supa = serverClient();
  const { count, error } = await supa.from('practice_attempts').select('*', { count: 'exact', head: true }).eq('user_id', userId);
  if (error) throw error;
  return count || 0;
}

export async function saveResponse(params: { attemptId: number; question: PracticeQuestion; answer: any }) {
  const { attemptId, question, answer } = params;
  const supa = serverClient();
  // Simple scoring
  const { isCorrect, score } = gradeAnswer(question, answer);
  const { error } = await supa.from('practice_responses').upsert({
    attempt_id: attemptId,
    question_id: question.id,
    answer,
    is_correct: isCorrect,
    score,
    max_score: 1
  });
  if (error) throw error;
  return { isCorrect, score };
}

function gradeAnswer(question: PracticeQuestion, answer: any): { isCorrect: boolean; score: number } {
  try {
    if (question.type === 'single_choice') {
      const correct = (question.correct_answer?.choice_ids || []) as number[];
      const given = (answer?.choice_ids || []) as number[];
      const isCorrect = correct.length === 1 && given.length === 1 && correct[0] === given[0];
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }
    if (question.type === 'multi_choice') {
      const correct = ((question.correct_answer?.choice_ids)||[]).slice().sort();
      const given = ((answer?.choice_ids)||[]).slice().sort();
      const isCorrect = JSON.stringify(correct) === JSON.stringify(given);
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }
    if (question.type === 'free_response') {
      const acceptable = (question.correct_answer?.answers || []) as string[];
      const normalized = (s: string) => s.trim().toLowerCase();
      const given = normalized(answer?.text || '');
      const isCorrect = acceptable.map(normalized).includes(given);
      return { isCorrect, score: isCorrect ? 1 : 0 };
    }
  } catch (e) {
    return { isCorrect: false, score: 0 };
  }
  return { isCorrect: false, score: 0 };
}

export async function finalizeAttempt(attemptId: number){
  const supa = serverClient();
  // Aggregate scores
  const { data: agg, error: aggErr } = await supa.rpc('compute_attempt_score', { p_attempt_id: attemptId });
  if (aggErr) {
    // fallback manual aggregation if RPC not created
    const { data: responses, error: rErr } = await supa.from('practice_responses').select('score, max_score').eq('attempt_id', attemptId);
    if (rErr) throw rErr;
    const total = (responses||[]).reduce((a,r)=> a + (r.score||0), 0);
    const max = (responses||[]).reduce((a,r)=> a + (r.max_score||1), 0);
    const percent = max ? (total / max) * 100 : null;
    const { error: upErr } = await supa.from('practice_attempts').update({
      completed_at: new Date().toISOString(),
      score_raw: total,
      score_max: max,
      percent
    }).eq('id', attemptId);
    if (upErr) throw upErr;
    return { total, max, percent };
  }
  return agg;
}
