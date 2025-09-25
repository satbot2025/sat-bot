import { getUserFromCookie } from '@/lib/session';
import { redirect } from 'next/navigation';
import { getAttemptCount } from '@/lib/practice';
import { getRegistrationRank } from '@/lib/db';
import { listFriends, addFriend, deleteFriend } from '@/lib/friends';

export default async function Dashboard(){
  const user = await getUserFromCookie();
  if (!user) redirect('/auth/login');
  const attempts = await getAttemptCount(user.id);
  const rank = await getRegistrationRank(user.id);
  const friends = await listFriends(user.id);

  async function actionAdd(formData: FormData){
    'use server';
    const username = String(formData.get('friend_username')||'').trim();
    if (!username) return;
    try { await addFriend(user!.id, username); } catch {}
  }

  async function actionDelete(formData: FormData){
    'use server';
    const fid = Number(formData.get('fid'));
    if (!Number.isFinite(fid)) return;
    try { await deleteFriend(user!.id, fid); } catch {}
  }

  return (
    <section className="card">
      <h1 className="h2">Welcome, {user.username} 👋</h1>
      <p className="muted">You are <strong>#{rank}</strong> registered student on SAT Bot.</p>
      {user.zipcode ? (
        <p className="muted">School location: <strong>{user.zipcode}</strong>{user.school_city || user.school_state ? ` — ${user.school_city ?? ''}${user.school_city && user.school_state ? ', ' : ''}${user.school_state ?? ''}` : ''}</p>
      ) : null}
      <p className="muted">This is your dashboard. Attempts completed: <strong>{attempts}</strong>.</p>
      <div className="card" style={{ marginTop:16 }}>
        <h2 className="h2">Quick actions</h2>
        <ul className="bullets">
          <li>Start a focus session</li>
          <li><a href="/practice">Try a practice test</a></li>
          <li>Resume last practice</li>
        </ul>
      </div>

      <div className="card" style={{ marginTop:16 }}>
        <h2 className="h2">Friends</h2>
        <form action={actionAdd} style={{ display:'flex', gap:8, marginBottom:12 }}>
          <input name="friend_username" className="input" placeholder="Add friend by username" />
          <button className="btn btn-primary" type="submit">Add Friend</button>
        </form>
        {friends.length === 0 ? <p className="muted">No friends yet. Add one!</p> : (
          <ul className="bullets">
            {friends.map(f => (
              <li key={f.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <span>@{f.friend.username}</span>
                <form action={actionDelete}>
                  <input type="hidden" name="fid" value={f.friend_user_id} />
                  <button className="btn" type="submit" style={{ background:'var(--danger-fade,#fee)', border:'1px solid var(--danger,#c33)' }}>Delete</button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
