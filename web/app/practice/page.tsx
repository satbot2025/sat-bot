import { getUserFromCookie } from '@/lib/session';
import { listTests, createAttempt } from '@/lib/practice';
import { redirect } from 'next/navigation';

export default async function PracticePage(){
  const user = await getUserFromCookie();
  if (!user) redirect('/auth/login');
  const tests = await listTests();

  async function startAttempt(formData: FormData){
    'use server';
    const testId = Number(formData.get('testId'));
    if (!Number.isFinite(testId)) return;
    await createAttempt(user!.id, testId);
    // TODO: redirect to attempt detail once implemented
    redirect('/dashboard');
  }

  return (
    <section className="card">
      <h1 className="h2">Practice Tests</h1>
      {tests.length === 0 ? (
        <p className="muted">No tests yet. We can add some from the database.</p>
      ) : (
        <ul className="bullets">
          {tests.map(t => (
            <li key={t.id}>
              <form action={startAttempt} style={{ display:'inline-flex', gap:8, alignItems:'center' }}>
                <input type="hidden" name="testId" value={t.id} />
                <span><strong>{t.title}</strong>{t.description ? ` — ${t.description}` : ''}</span>
                <button className="btn btn-primary" type="submit">Start</button>
              </form>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
