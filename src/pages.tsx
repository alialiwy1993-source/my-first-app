import { useEffect, useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import {
  ArchiveRestore,
  FileSpreadsheet,
  ListFilter,
  RefreshCw,
  Save,
  Trash2,
  UserPlus,
} from 'lucide-react';
import { appPost } from './api';
import type {
  DeletedLoan,
  Loan,
  LoanStatus,
  Session,
  Settings,
  Stats,
  UserPublic,
} from './types';
import { formatDateTime, formatMoney, statusLabels } from './types';

const pageSizes = [25, 50, 100];

function Notice({ text }: { text: string }) {
  if (!text) return null;
  return <div className="notice">{text}</div>;
}

function StatusBadge({ status }: { status: LoanStatus }) {
  return <span className={`badge ${status}`}>{statusLabels[status]}</span>;
}

export function Dashboard({ onOpenRecords }: { onOpenRecords: (status: LoanStatus) => void }) {
  const [limit, setLimit] = useState(25);
  const [stats, setStats] = useState<Stats>({ total: 0, waiting: 0, monthly: 0, paid: 0, excluded: 0, deleted: 0 });
  const [settings, setSettings] = useState<Settings>({ defaultLoanAmount: 0 });
  const [waiting, setWaiting] = useState<Loan[]>([]);
  const [monthly, setMonthly] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const data = await appPost<{ stats: Stats; settings: Settings; waiting: Loan[]; monthly: Loan[] }>('/api/dashboard', { limit });
      setStats(data.stats);
      setSettings(data.settings);
      setWaiting(data.waiting);
      setMonthly(data.monthly);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, [limit]);

  return (
    <div className="stack">
      <div className="stats-grid">
        <div className="stat-card"><span>إجمالي الطلبات</span><strong>{stats.total}</strong></div>
        <div className="stat-card blue"><span>قائمة الانتظار</span><strong>{stats.waiting}</strong></div>
        <div className="stat-card green"><span>الحصة الشهرية</span><strong>{stats.monthly}</strong></div>
        <div className="stat-card purple"><span>المبلغ الافتراضي</span><strong className="money-small">{formatMoney(settings.defaultLoanAmount)}</strong></div>
        <div className="stat-card"><span>تم الصرف</span><strong>{stats.paid}</strong></div>
        <div className="stat-card"><span>المستبعدون</span><strong>{stats.excluded}</strong></div>
        <div className="stat-card red"><span>المحذوفون</span><strong>{stats.deleted}</strong></div>
      </div>

      <div className="panel queue-panel">
        <div className="panel-head">
          <div>
            <h3><ListFilter size={20} /> العرض في الواجهة الرئيسية</h3>
            <p>العدد الافتراضي الثابت هو 25 ويمكن تغييره مؤقتاً.</p>
          </div>
          <select value={limit} onChange={e => setLimit(Number(e.target.value))}>
            {pageSizes.map(v => <option key={v} value={v}>{v} طلب</option>)}
          </select>
        </div>
        {loading ? <div className="loading">جاري التحديث...</div> : null}
      </div>

      <QueueBlock title="قائمة الانتظار" rows={waiting} onAll={() => onOpenRecords('waiting')} />
      <QueueBlock title="المشمولون بالحصة الشهرية" rows={monthly} onAll={() => onOpenRecords('monthly')} />
    </div>
  );
}

function QueueBlock({ title, rows, onAll }: { title: string; rows: Loan[]; onAll: () => void }) {
  const sorted = [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div className="panel">
      <div className="panel-head">
        <h3>{title} <span className="count-pill">{rows.length}</span></h3>
        <button className="btn secondary" onClick={onAll}>عرض القائمة</button>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>#</th><th>الاسم</th><th>المبلغ</th><th>وقت التسجيل</th><th>بواسطة</th></tr></thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={row.id}>
                <td>{i + 1}</td>
                <td><b>{row.name}</b><div className="muted small">{row.phone || row.nationalId}</div></td>
                <td>{formatMoney(row.amount)}</td>
                <td>{formatDateTime(row.createdAt)}</td>
                <td>{row.registeredByName}</td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={5} className="empty">لا توجد طلبات حالياً</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LoanForm({ editId, onDone }: { editId: string | null; onDone: () => void }) {
  const [settings, setSettings] = useState<Settings>({ defaultLoanAmount: 0 });
  const [form, setForm] = useState({ name: '', phone: '', nationalId: '', amount: 0, notes: '', status: 'waiting' as LoanStatus });
  const [message, setMessage] = useState('');

  useEffect(() => {
    void appPost<Settings>('/api/settings/get').then(data => {
      setSettings(data);
      if (!editId) setForm(v => ({ ...v, amount: data.defaultLoanAmount || 0 }));
    });
    if (editId) {
      void appPost<{ loan: Loan }>('/api/loans/get', { id: editId }).then(({ loan }) =>
        setForm({ name: loan.name, phone: loan.phone, nationalId: loan.nationalId, amount: loan.amount, notes: loan.notes, status: loan.status })
      );
    }
  }, [editId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    if (!form.name.trim()) { setMessage('الاسم مطلوب'); return; }
    if (editId) await appPost('/api/loans/update', { id: editId, ...form });
    else await appPost('/api/loans/create', form);
    setMessage(editId ? 'تم تحديث الطلب بنجاح' : 'تم تسجيل الطلب بنجاح');
    if (!editId) setForm({ name: '', phone: '', nationalId: '', amount: settings.defaultLoanAmount || 0, notes: '', status: 'waiting' });
    setTimeout(onDone, 500);
  }

  return (
    <div className="panel form-panel">
      <div className="panel-head"><div><h3>{editId ? 'تعديل طلب السلفة' : 'تسجيل طلب سلفة جديد'}</h3><p>يسجل النظام تاريخ ووقت التسجيل واسم المستخدم تلقائياً.</p></div></div>
      <Notice text={message} />
      <form onSubmit={submit} className="form-grid">
        <label><span>الاسم الكامل *</span><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label>
        <label><span>رقم الهاتف</span><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} /></label>
        <label><span>الرقم الوطني / الوظيفي</span><input value={form.nationalId} onChange={e => setForm({ ...form, nationalId: e.target.value })} /></label>
        <label><span>مبلغ السلفة</span><input type="number" min="0" value={form.amount} onChange={e => setForm({ ...form, amount: Number(e.target.value) })} /></label>
        <label><span>الحالة</span><select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as LoanStatus })}>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
        <label className="full"><span>الملاحظات</span><textarea rows={5} placeholder="اكتب أي ملاحظات تخص الطلب هنا..." value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></label>
        <div className="full form-actions"><button className="btn primary" type="submit"><Save size={17} /> حفظ الطلب</button></div>
      </form>
    </div>
  );
}

export function Records({ initialStatus, onEdit }: { initialStatus: LoanStatus | ''; onEdit: (id: string) => void }) {
  const [rows, setRows] = useState<Loan[]>([]);
  const [pageSize, setPageSize] = useState(25);
  const [status, setStatus] = useState<LoanStatus | ''>(initialStatus);
  const [search, setSearch] = useState('');
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [currentToken, setCurrentToken] = useState<string | undefined>();
  const [history, setHistory] = useState<(string | undefined)[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<Loan | null>(null);
  const [deleteReason, setDeleteReason] = useState('');
  const [message, setMessage] = useState('');

  async function load(token?: string, resetHistory = false) {
    const data = await appPost<{ items: Loan[]; nextToken?: string }>('/api/loans/list', { pageSize, nextToken: token || '', status });
    setRows(data.items.sort((a, b) => b.createdAt.localeCompare(a.createdAt)));
    setNextToken(data.nextToken);
    setCurrentToken(token);
    if (resetHistory) setHistory([]);
  }

  useEffect(() => { void load(undefined, true); }, [pageSize, status]);
  useEffect(() => { setStatus(initialStatus); }, [initialStatus]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q ? rows.filter(r => [r.name, r.phone, r.nationalId, r.notes].some(v => v.toLowerCase().includes(q))) : rows;
  }, [rows, search]);

  async function confirmDelete() {
    if (!deleteTarget || !deleteReason.trim()) { setMessage('يجب كتابة سبب الحذف قبل المتابعة'); return; }
    await appPost('/api/loans/delete', { id: deleteTarget.id, reason: deleteReason.trim() });
    setDeleteTarget(null); setDeleteReason(''); setMessage('تم نقل الاسم إلى قائمة المحذوفين مع تسجيل السبب');
    await load(currentToken);
  }

  function goNext() { if (!nextToken) return; setHistory(v => [...v, currentToken]); void load(nextToken); }
  function goBack() { if (!history.length) return; const copy = [...history]; const token = copy.pop(); setHistory(copy); void load(token); }

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>جميع الطلبات</h3><p>يمكن عرض 25 أو 50 أو 100 طلب في الصفحة.</p></div><button className="btn secondary" onClick={() => load(currentToken)}><RefreshCw size={16} /> تحديث</button></div>
      <Notice text={message} />
      <div className="filters">
        <input placeholder="بحث في الصفحة الحالية..." value={search} onChange={e => setSearch(e.target.value)} />
        <select value={status} onChange={e => setStatus(e.target.value as LoanStatus | '')}><option value="">كل الحالات</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select>
        <select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>{pageSizes.map(v => <option key={v} value={v}>{v} طلب</option>)}</select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>الاسم</th><th>المبلغ</th><th>الحالة</th><th>التسجيل</th><th>الملاحظات</th><th>إجراءات</th></tr></thead>
          <tbody>
            {visible.map(row => (
              <tr key={row.id}>
                <td><b>{row.name}</b><div className="muted small">{row.phone || row.nationalId}</div></td>
                <td>{formatMoney(row.amount)}</td>
                <td><StatusBadge status={row.status} /></td>
                <td>{formatDateTime(row.createdAt)}<div className="muted small">{row.registeredByName}</div></td>
                <td className="notes-cell">{row.notes || '-'}</td>
                <td><div className="row-actions"><button className="icon-btn" onClick={() => onEdit(row.id)}>تعديل</button><button className="icon-btn danger" onClick={() => { setDeleteTarget(row); setMessage(''); }}>حذف</button></div></td>
              </tr>
            ))}
            {!visible.length ? <tr><td colSpan={6} className="empty">لا توجد بيانات</td></tr> : null}
          </tbody>
        </table>
      </div>
      <div className="pager"><button className="btn secondary" disabled={!history.length} onClick={goBack}>السابق</button><button className="btn secondary" disabled={!nextToken} onClick={goNext}>التالي</button></div>
      {deleteTarget ? (
        <div className="modal-backdrop"><div className="modal"><Trash2 size={28} /><h3>حذف {deleteTarget.name}</h3><p>سبب الحذف إلزامي وسيظهر في قائمة المحذوفين.</p><textarea rows={4} placeholder="اكتب سبب الحذف..." value={deleteReason} onChange={e => setDeleteReason(e.target.value)} autoFocus /><div className="modal-actions"><button className="btn secondary" onClick={() => { setDeleteTarget(null); setDeleteReason(''); }}>إلغاء</button><button className="btn danger" disabled={!deleteReason.trim()} onClick={() => void confirmDelete()}>تأكيد الحذف</button></div></div></div>
      ) : null}
    </div>
  );
}

export function Deleted({ session }: { session: Session }) {
  const [rows, setRows] = useState<DeletedLoan[]>([]);
  const [pageSize, setPageSize] = useState(25);
  const [nextToken, setNextToken] = useState<string | undefined>();
  const [currentToken, setCurrentToken] = useState<string | undefined>();
  const [history, setHistory] = useState<(string | undefined)[]>([]);
  const [message, setMessage] = useState('');

  async function load(token?: string) {
    const data = await appPost<{ items: DeletedLoan[]; nextToken?: string }>('/api/deleted/list', { pageSize, nextToken: token || '' });
    setRows(data.items.sort((a, b) => b.deletedAt.localeCompare(a.deletedAt)));
    setNextToken(data.nextToken); setCurrentToken(token);
  }
  useEffect(() => { setHistory([]); void load(); }, [pageSize]);

  async function restore(id: string) { await appPost('/api/deleted/restore', { id }); setMessage('تم استرجاع الطلب بنجاح'); await load(currentToken); }

  return (
    <div className="panel">
      <div className="panel-head"><div><h3>قائمة المحذوفين</h3><p>يظهر سبب الحذف، المستخدم، والتاريخ والوقت.</p></div><select value={pageSize} onChange={e => setPageSize(Number(e.target.value))}>{pageSizes.map(v => <option key={v} value={v}>{v}</option>)}</select></div>
      <Notice text={message} />
      <div className="table-wrap"><table><thead><tr><th>الاسم</th><th>سبب الحذف</th><th>حذف بواسطة</th><th>وقت الحذف</th><th>المبلغ</th>{session.user.role === 'admin' ? <th>إجراء</th> : null}</tr></thead><tbody>
        {rows.map(row => <tr key={row.id}><td><b>{row.name}</b></td><td className="reason-cell">{row.deletionReason}</td><td>{row.deletedByName}</td><td>{formatDateTime(row.deletedAt)}</td><td>{formatMoney(row.amount)}</td>{session.user.role === 'admin' ? <td><button className="icon-btn restore" onClick={() => void restore(row.id)}><ArchiveRestore size={15} /> استرجاع</button></td> : null}</tr>)}
        {!rows.length ? <tr><td colSpan={6} className="empty">لا توجد أسماء محذوفة</td></tr> : null}
      </tbody></table></div>
      <div className="pager"><button className="btn secondary" disabled={!history.length} onClick={() => { const copy = [...history]; const token = copy.pop(); setHistory(copy); void load(token); }}>السابق</button><button className="btn secondary" disabled={!nextToken} onClick={() => { setHistory(v => [...v, currentToken]); void load(nextToken); }}>التالي</button></div>
    </div>
  );
}

function valueByKeys(row: Record<string, unknown>, keys: string[]) {
  const entries = Object.entries(row);
  for (const key of keys) {
    const found = entries.find(([k]) => k.trim().toLowerCase() === key.toLowerCase());
    if (found) return found[1];
  }
  return undefined;
}

function normalizeStatus(value: unknown): LoanStatus {
  const text = String(value || '').trim();
  if (text.includes('حصة') || text.includes('monthly')) return 'monthly';
  if (text.includes('صرف') || text.includes('paid')) return 'paid';
  if (text.includes('مستبعد') || text.includes('excluded')) return 'excluded';
  return 'waiting';
}

export function ImportExcel() {
  const [settings, setSettings] = useState<Settings>({ defaultLoanAmount: 0 });
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [preview, setPreview] = useState<Array<{ name: string; phone: string; nationalId: string; amount: number; notes: string; status: LoanStatus }>>([]);
  const [message, setMessage] = useState('');
  useEffect(() => { void appPost<Settings>('/api/settings/get').then(setSettings); }, []);

  function convert(raw: Record<string, unknown>[]) {
    return raw.map(row => {
      const first = Object.values(row)[0];
      const name = String(valueByKeys(row, ['الاسم', 'اسم', 'name', 'full name']) ?? first ?? '').trim();
      const phone = String(valueByKeys(row, ['الهاتف', 'رقم الهاتف', 'phone', 'mobile']) ?? '').trim();
      const nationalId = String(valueByKeys(row, ['الرقم', 'الرقم الوطني', 'الرقم الوظيفي', 'id']) ?? '').trim();
      const amountRaw = valueByKeys(row, ['المبلغ', 'مبلغ السلفة', 'amount']);
      const amount = Number(amountRaw ?? settings.defaultLoanAmount ?? 0) || 0;
      const notes = String(valueByKeys(row, ['الملاحظات', 'ملاحظات', 'notes']) ?? '').trim();
      const status = normalizeStatus(valueByKeys(row, ['الحالة', 'status']));
      return { name, phone, nationalId, amount, notes, status };
    }).filter(row => row.name);
  }

  async function pick(file: File) {
    setMessage('');
    const data = await file.arrayBuffer();
    const wb = XLSX.read(data);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const raw = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
    setRows(raw); setPreview(convert(raw));
  }

  async function importAll() {
    const converted = convert(rows);
    if (!converted.length) { setMessage('لا توجد أسماء صالحة للاستيراد'); return; }
    let imported = 0;
    for (let i = 0; i < converted.length; i += 100) {
      const data = await appPost<{ imported: number }>('/api/import', { rows: converted.slice(i, i + 100) });
      imported += data.imported;
    }
    setMessage(`تم استيراد ${imported} اسماً بنجاح`);
  }

  function downloadTemplate() {
    const sheet = XLSX.utils.json_to_sheet([{ 'الاسم': 'مثال', 'رقم الهاتف': '07XXXXXXXXX', 'الرقم الوطني': '', 'مبلغ السلفة': settings.defaultLoanAmount || 0, 'الحالة': 'قائمة الانتظار', 'الملاحظات': '' }]);
    const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, sheet, 'السلف'); XLSX.writeFile(wb, 'نموذج-استيراد-السلف.xlsx');
  }

  return (
    <div className="panel">
      <div className="panel-head"><div><h3><FileSpreadsheet size={21} /> استيراد الأسماء من Excel</h3><p>يمكن أن يحتوي الملف على الاسم فقط، أو الاسم مع بقية البيانات.</p></div><button className="btn secondary" onClick={downloadTemplate}>تنزيل نموذج Excel</button></div>
      <Notice text={message} />
      <div className="upload-box"><input type="file" accept=".xlsx,.xls,.csv" onChange={e => { const file = e.target.files?.[0]; if (file) void pick(file); }} /><p>الأعمدة المدعومة: الاسم، رقم الهاتف، الرقم الوطني/الوظيفي، مبلغ السلفة، الحالة، الملاحظات.</p></div>
      {preview.length ? <><h4>معاينة أول 10 أسماء من أصل {preview.length}</h4><div className="table-wrap"><table><thead><tr><th>الاسم</th><th>الهاتف</th><th>المبلغ</th><th>الحالة</th><th>الملاحظات</th></tr></thead><tbody>{preview.slice(0, 10).map((r, i) => <tr key={`${r.name}-${i}`}><td>{r.name}</td><td>{r.phone || '-'}</td><td>{formatMoney(r.amount)}</td><td><StatusBadge status={r.status} /></td><td>{r.notes || '-'}</td></tr>)}</tbody></table></div><div className="form-actions"><button className="btn primary" onClick={() => void importAll()}>استيراد {preview.length} اسماً</button></div></> : null}
    </div>
  );
}

export function Users() {
  const [users, setUsers] = useState<UserPublic[]>([]);
  const [form, setForm] = useState({ username: '', name: '', password: '', role: 'employee' as 'admin' | 'employee' });
  const [message, setMessage] = useState('');
  async function load() { const data = await appPost<{ users: UserPublic[] }>('/api/users/list'); setUsers(data.users); }
  useEffect(() => { void load(); }, []);
  async function create(e: React.FormEvent) { e.preventDefault(); await appPost('/api/users/create', form); setForm({ username: '', name: '', password: '', role: 'employee' }); setMessage('تم إنشاء حساب المستخدم'); await load(); }
  async function toggle(user: UserPublic) { await appPost('/api/users/toggle', { id: user.id, active: !user.active }); await load(); }
  async function reset(user: UserPublic) { const password = window.prompt(`كلمة المرور الجديدة لـ ${user.username}`); if (password) { await appPost('/api/users/reset-password', { id: user.id, password }); setMessage('تم تغيير كلمة المرور'); } }
  return (
    <div className="two-col">
      <div className="panel"><h3><UserPlus size={20} /> إضافة مستخدم</h3><Notice text={message} /><form onSubmit={create} className="stack-form"><label><span>اسم المستخدم</span><input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required /></label><label><span>الاسم الظاهر</span><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></label><label><span>كلمة المرور</span><input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} minLength={4} required /></label><label><span>الصلاحية</span><select value={form.role} onChange={e => setForm({ ...form, role: e.target.value as 'admin' | 'employee' })}><option value="employee">موظف</option><option value="admin">مسؤول</option></select></label><button className="btn primary">إنشاء الحساب</button></form></div>
      <div className="panel"><h3>حسابات المستخدمين</h3><div className="user-list">{users.map(user => <div className="user-card" key={user.id}><div><b>{user.name}</b><div className="muted">{user.username} · {user.role === 'admin' ? 'مسؤول' : 'موظف'}</div></div><div className="row-actions"><span className={`state-dot ${user.active ? 'on' : 'off'}`}>{user.active ? 'فعال' : 'موقوف'}</span><button className="icon-btn" onClick={() => void reset(user)}>كلمة المرور</button><button className="icon-btn" onClick={() => void toggle(user)}>{user.active ? 'إيقاف' : 'تفعيل'}</button></div></div>)}</div></div>
    </div>
  );
}

export function Account({ session }: { session: Session }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  async function change(e: React.FormEvent) { e.preventDefault(); await appPost('/api/account/password', { oldPassword, newPassword }); setOldPassword(''); setNewPassword(''); setMessage('تم تغيير كلمة المرور بنجاح'); }
  return (
    <div className="two-col">
      <div className="panel profile-card"><div className="avatar">{session.user.name.slice(0, 1)}</div><h3>{session.user.name}</h3><p>{session.user.username}</p><span className="role-pill">{session.user.role === 'admin' ? 'مسؤول النظام' : 'موظف'}</span></div>
      <div className="panel"><h3>تغيير كلمة المرور</h3><Notice text={message} /><form onSubmit={change} className="stack-form"><label><span>كلمة المرور الحالية</span><input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required /></label><label><span>كلمة المرور الجديدة</span><input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={4} required /></label><button className="btn primary">تحديث كلمة المرور</button></form></div>
    </div>
  );
}

export function SettingsPage() {
  const [amount, setAmount] = useState(0);
  const [message, setMessage] = useState('');
  useEffect(() => { void appPost<Settings>('/api/settings/get').then(s => setAmount(s.defaultLoanAmount)); }, []);
  async function save(e: React.FormEvent) { e.preventDefault(); await appPost('/api/settings/save', { defaultLoanAmount: amount }); setMessage('تم حفظ مبلغ السلفة الافتراضي'); }
  return (
    <div className="panel form-panel"><h3>إعدادات النظام</h3><p className="muted">يستخدم المبلغ الافتراضي تلقائياً عند تسجيل طلب جديد أو استيراد أسماء لا تحتوي على مبلغ.</p><Notice text={message} /><form onSubmit={save} className="stack-form narrow"><label><span>مبلغ السلفة الافتراضي (د.ع)</span><input type="number" min="0" value={amount} onChange={e => setAmount(Number(e.target.value))} /></label><button className="btn primary"><Save size={17} /> حفظ الإعداد</button></form></div>
  );
}
