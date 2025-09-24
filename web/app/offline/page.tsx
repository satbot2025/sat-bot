export default function Offline(){
  return (
    <main className="container">
      <section className="card">
        <h1 className="h1">You're offline</h1>
        <p className="muted">No internet connection detected. You can still open the app. When you're back online, features will auto-resume.</p>
        <a className="btn btn-primary" href="/">Back to app</a>
      </section>
    </main>
  );
}
