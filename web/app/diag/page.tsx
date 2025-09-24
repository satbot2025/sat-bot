import { publicClient, serverClient } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Diag() {
  const results: Record<string, any> = {};

  // Check envs
  results.env = {
    hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnon: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasService: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    hasSessionSecret: !!process.env.SESSION_SECRET,
  };

  // Public read: practice_tests
  try{
    const pub = publicClient();
    const { data, error } = await pub.from('practice_tests').select('id, title').limit(5);
    results.publicRead = { ok: !error, rows: data?.length ?? 0, error: error?.message };
  } catch (e:any) {
    results.publicRead = { ok: false, error: e?.message || String(e) };
  }

  // Server read: users count
  try{
    const srv = serverClient();
    const { count, error } = await srv.from('users').select('*', { count: 'exact', head: true });
    results.serverUsers = { ok: !error, count: count ?? 0, error: error?.message };
  } catch (e:any) {
    results.serverUsers = { ok: false, error: e?.message || String(e) };
  }

  return (
    <section className="card">
      <h1 className="h2">Diagnostics</h1>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(results, null, 2)}</pre>
      <p className="muted">Tip: Only run this in dev. Remove in production.</p>
    </section>
  );
}
