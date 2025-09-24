import os
import sqlite3
from pathlib import Path
from datetime import timedelta
from flask import Flask, g, render_template, request, redirect, url_for, session, flash, send_from_directory, abort, make_response
from werkzeug.security import generate_password_hash, check_password_hash


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / 'satbot.db'


def create_app():
    app = Flask(__name__, static_folder='static', template_folder='templates')
    # NOTE: set a stronger secret in production via env var
    app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-change-me')
    app.permanent_session_lifetime = timedelta(days=7)

    # Security headers
    @app.after_request
    def set_headers(resp):
        # Prevent caching of authenticated pages
        if session.get('user_id'):
            resp.headers['Cache-Control'] = 'no-store'
        # Basic hardening
        resp.headers.setdefault('X-Content-Type-Options', 'nosniff')
        resp.headers.setdefault('X-Frame-Options', 'DENY')
        resp.headers.setdefault('Referrer-Policy', 'strict-origin-when-cross-origin')
        return resp

    # DB helpers
    def get_db():
        if 'db' not in g:
            g.db = sqlite3.connect(DB_PATH)
            g.db.row_factory = sqlite3.Row
        return g.db

    @app.teardown_appcontext
    def close_db(_):
        db = g.pop('db', None)
        if db is not None:
            db.close()

    def init_db():
        db = get_db()
        db.execute(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            );
            """
        )
        db.commit()

    with app.app_context():
        init_db()

    # Auth utilities
    def current_user():
        uid = session.get('user_id')
        if not uid:
            return None
        db = get_db()
        return db.execute('SELECT id, username FROM users WHERE id = ?', (uid,)).fetchone()

    def login_required(view):
        from functools import wraps
        @wraps(view)
        def wrapped(*args, **kwargs):
            if not session.get('user_id'):
                return redirect(url_for('login', next=request.path))
            return view(*args, **kwargs)
        return wrapped

    # Routes
    @app.get('/')
    def home():
        user = current_user()
        return render_template('home.html', user=user)

    @app.route('/register', methods=['GET', 'POST'])
    def register():
        if request.method == 'POST':
            username = (request.form.get('username') or '').strip().lower()
            password = request.form.get('password') or ''
            # Basic validation
            if not (3 <= len(username) <= 20) or not username.isalnum():
                flash('Username must be 3-20 letters/numbers.', 'error')
            elif len(password) < 6:
                flash('Password must be at least 6 characters.', 'error')
            else:
                try:
                    db = get_db()
                    db.execute('INSERT INTO users (username, password_hash) VALUES (?, ?)', (
                        username,
                        generate_password_hash(password)
                    ))
                    db.commit()
                    flash('Account created! Please sign in.', 'success')
                    return redirect(url_for('login'))
                except sqlite3.IntegrityError:
                    flash('That username is taken. Try another.', 'error')
        return render_template('register.html')

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            username = (request.form.get('username') or '').strip().lower()
            password = request.form.get('password') or ''
            db = get_db()
            user = db.execute('SELECT id, username, password_hash FROM users WHERE username = ?', (username,)).fetchone()
            if user and check_password_hash(user['password_hash'], password):
                session.clear()
                session.permanent = True
                session['user_id'] = user['id']
                next_url = request.args.get('next') or url_for('dashboard')
                return redirect(next_url)
            flash('Invalid username or password.', 'error')
        return render_template('login.html')

    @app.get('/logout')
    def logout():
        session.clear()
        flash('Signed out.', 'success')
        return redirect(url_for('home'))

    @app.get('/dashboard')
    @login_required
    def dashboard():
        user = current_user()
        return render_template('dashboard.html', user=user)

    # PWA/Static files still served by Flask
    @app.get('/manifest.webmanifest')
    def manifest():
        return send_from_directory(app.root_path, 'manifest.webmanifest', mimetype='application/manifest+json')

    @app.get('/sw.js')
    def service_worker():
        # Ensure SW is not cached incorrectly during deploys
        resp = make_response(send_from_directory(app.root_path, 'sw.js'))
        resp.headers['Cache-Control'] = 'no-store'
        return resp

    @app.get('/offline.html')
    def offline_page():
        return send_from_directory(app.root_path, 'offline.html')

    return app


if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=int(os.environ.get('PORT', 5173)), debug=True)
