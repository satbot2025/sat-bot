import { getUserFromCookie } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getAttemptCount } from '@/lib/practice';
import { getRegistrationRank } from '@/lib/db';

export default async function Dashboard(){
  const user = await getUserFromCookie();
  if (!user) redirect('/auth/login');
  const attempts = await getAttemptCount(user.id);
  const rank = await getRegistrationRank(user.id);
  return (
    <section className="card">
      <h1 className="h2">Welcome, {user.username} 👋</h1>
      <p className="muted">You are <strong>#{rank}</strong> registered student on SAT Bot.</p>
      {user.zipcode ? (
        <p className="muted">School location: <strong>{user.zipcode}</strong>{user.school_city || user.school_state ? ` — ${user.school_city ?? ''}${user.school_city && user.school_state ? ', ' : ''}${user.school_state ?? ''}` : ''}</p>
      ) : null}
      <p className="muted">This is your dashboard. Attempts completed: <strong>{attempts}</strong>.</p>
      <div className="card">
        <h2 className="h2">Quick actions</h2>
        <ul className="bullets">
          <li>Start a focus session</li>
          <li><a href="/practice">Try a practice test</a></li>
          <li>Resume last practice</li>
        </ul>
      </div>
    </section>
  );
}
