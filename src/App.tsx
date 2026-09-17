import { useEffect, useState } from 'react';
import {
  Archive,
  FilePlus2,
  FileSpreadsheet,
  Gauge,
  LogOut,
  Menu,
  Settings,
  Trash2,
  UserCircle,
  Users,
  X,
} from 'lucide-react';
import { appPost, clearSession, login, readSession, storeSession } from './api';
import {
  Account,
  Dashboard,
  Deleted,
  ImportExcel,
  LoanForm,
  Records,
  SettingsPage,
  Users as UsersPage,
} from './pages';
import type { LoanStatus, Session } from './types';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
}

type View =
  | 'dashboard'
  | 'new'
  | 'records'
  | 'deleted'
  | 'import'
  | 'users'
  | 'account'
  | 'settings';

function Login({ onLogin }: { onLogin: (session: Session) => void }) {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorText('');
    try {
      const session = await login(username.trim(), password);
      storeSession(session);
      onLogin(session);
    } catch {
      setErrorText('اسم المستخدم أو كلمة المرور غير صحيحة');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="logo-box">س</div>
        <h1>برنامج حجز السلف</h1>
        <p>نظام الإدارة المركزي</p>
        <form onSubmit={submit}>
          <label>
            <span>اسم المستخدم</span>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            <span>كلمة المرور</span>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {errorText ? <div className="error-box">{errorText}</div> : null}
          <button className="btn primary full-btn" disabled={busy}>
            {busy ? 'جاري الدخول...' : 'تسجيل الدخول'}
          </button>
        </form>
        <div className="first-login">
          الدخول الأول: <b>admin / admin123</b>
          <br />
          غيّر كلمة المرور بعد أول دخول من صفحة حساب المستخدم.
        </div>
      </div>
    </div>
  );
}

function Workspace({
  session,
  onLogout,
}: {
  session: Session;
  onLogout: () => void;
}) {
  const [view, setView] = useState<View>('dashboard');
  const [menuOpen, setMenuOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [recordsStatus, setRecordsStatus] = useState<LoanStatus | ''>('');
  const [installPrompt, setInstallPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function logout() {
    try {
      await appPost('/api/logout');
    } catch {
      // local logout still succeeds
    }
    clearSession();
    onLogout();
  }

  function navigate(next: View) {
    setView(next);
    setMenuOpen(false);
    if (next !== 'new') setEditId(null);
  }
  function openRecords(status: LoanStatus) {
    setRecordsStatus(status);
    setView('records');
  }
  function editLoan(id: string) {
    setEditId(id);
    setView('new');
  }

  const title: Record<View, string> = {
    dashboard: 'الرئيسية',
    new: editId ? 'تعديل الطلب' : 'طلب جديد',
    records: 'طلبات السلف',
    deleted: 'المحذوفون',
    import: 'استيراد Excel',
    users: 'المستخدمون',
    account: 'حساب المستخدم',
    settings: 'الإعدادات',
  };
  const nav = [
    ['dashboard', 'الرئيسية', Gauge],
    ['new', 'تسجيل طلب', FilePlus2],
    ['records', 'جميع الطلبات', Archive],
    ['deleted', 'المحذوفون', Trash2],
    ['import', 'استيراد Excel', FileSpreadsheet],
    ['account', 'حساب المستخدم', UserCircle],
  ] as const;

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <div className="side-brand">
          <div className="side-logo">س</div>
          <div>
            <b>حجز السلف</b>
            <span>الإدارة المركزية</span>
          </div>
          <button className="mobile-close" onClick={() => setMenuOpen(false)}>
            <X />
          </button>
        </div>
        <nav>
          {nav.map(([key, label, Icon]) => (
            <button
              key={key}
              className={view === key ? 'active' : ''}
              onClick={() => {
                if (key === 'records') setRecordsStatus('');
                navigate(key);
              }}
            >
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
          {session.user.role === 'admin' ? (
            <>
              <button
                className={view === 'users' ? 'active' : ''}
                onClick={() => navigate('users')}
              >
                <Users size={19} />
                <span>المستخدمون</span>
              </button>
              <button
                className={view === 'settings' ? 'active' : ''}
                onClick={() => navigate('settings')}
              >
                <Settings size={19} />
                <span>الإعدادات</span>
              </button>
            </>
          ) : null}
        </nav>
        <div className="side-footer">
          <div className="signed-user">
            <div className="mini-avatar">{session.user.name.slice(0, 1)}</div>
            <div>
              <b>{session.user.name}</b>
              <span>{session.user.role === 'admin' ? 'مسؤول' : 'موظف'}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={() => void logout()}>
            <LogOut size={17} /> خروج
          </button>
        </div>
      </aside>
      {menuOpen ? (
        <div className="scrim" onClick={() => setMenuOpen(false)} />
      ) : null}
      <main className="main-area">
        <header className="topbar">
          <button className="menu-btn" onClick={() => setMenuOpen(true)}>
            <Menu />
          </button>
          <div>
            <h2>{title[view]}</h2>
            <p>مرحباً، {session.user.name}</p>
          </div>
          <div className="top-actions">
            {installPrompt ? (
              <button
                className="btn secondary"
                onClick={async () => {
                  await installPrompt.prompt();
                  await installPrompt.userChoice;
                  setInstallPrompt(null);
                }}
              >
                تثبيت التطبيق
              </button>
            ) : null}
          </div>
        </header>
        <div className="content-area">
          {view === 'dashboard' ? (
            <Dashboard onOpenRecords={openRecords} />
          ) : null}
          {view === 'new' ? (
            <LoanForm
              editId={editId}
              onDone={() => {
                setEditId(null);
                setRecordsStatus('');
                setView('records');
              }}
            />
          ) : null}
          {view === 'records' ? (
            <Records initialStatus={recordsStatus} onEdit={editLoan} />
          ) : null}
          {view === 'deleted' ? <Deleted session={session} /> : null}
          {view === 'import' ? <ImportExcel /> : null}
          {view === 'users' && session.user.role === 'admin' ? (
            <UsersPage />
          ) : null}
          {view === 'account' ? <Account session={session} /> : null}
          {view === 'settings' && session.user.role === 'admin' ? (
            <SettingsPage />
          ) : null}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState<Session | null>(() => readSession());
  return session ? (
    <Workspace session={session} onLogout={() => setSession(null)} />
  ) : (
    <Login onLogin={setSession} />
  );
}

export default App;
