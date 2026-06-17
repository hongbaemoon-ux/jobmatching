import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { buildDashboardStats, generateReceiptNo, getMatchedCompanies, validateApplicantForm } from './lib/rules'
import { buildEmailLogs, managers, seedApplicants, seedCompanies } from './lib/seed'
import { INDUSTRIES } from './lib/types'
import type { Applicant, ApplicantDraft, Company, EmailLog } from './lib/types'

const storageKey = 'jobmatching-mvp-v1'

type Store = { applicants: Applicant[]; companies: Company[]; emailLogs: EmailLog[] }
const initialStore: Store = { applicants: seedApplicants, companies: seedCompanies, emailLogs: buildEmailLogs(seedApplicants, seedCompanies) }

function loadStore(): Store {
  try {
    const saved = localStorage.getItem(storageKey)
    return saved ? JSON.parse(saved) : initialStore
  } catch {
    return initialStore
  }
}

function App() {
  const [store, setStore] = useState<Store>(loadStore)
  const [view, setView] = useState<'apply' | 'login' | 'admin'>('apply')
  const [admin, setAdmin] = useState('')
  const [loginError, setLoginError] = useState('')
  const [selectedApplicantId, setSelectedApplicantId] = useState(store.applicants[0]?.id ?? '')

  function save(next: Store) {
    setStore(next)
    localStorage.setItem(storageKey, JSON.stringify(next))
  }

  function resetDemo() {
    localStorage.removeItem(storageKey)
    setStore(initialStore)
    setSelectedApplicantId(initialStore.applicants[0]?.id ?? '')
  }

  function handleLogin(email: string, password: string) {
    const found = managers.find((manager) => manager.email === email && manager.password === password)
    if (!found) {
      setLoginError('테스트 관리자 계정 정보가 올바르지 않습니다.')
      return
    }
    setAdmin(found.email)
    setLoginError('')
    setView('admin')
  }

  function handleApplicantSubmit(draft: ApplicantDraft) {
    const today = new Date().toISOString().slice(0, 10)
    const todayCount = store.applicants.filter((applicant) => applicant.createdAt.startsWith(today)).length
    const matchedCompanies = getMatchedCompanies(draft, store.companies)
    const applicant: Applicant = {
      ...draft,
      jobCategory: draft.jobCategory as Applicant['jobCategory'],
      id: crypto.randomUUID(),
      receiptNo: generateReceiptNo(today, todayCount + 1),
      createdAt: new Date().toISOString(),
      consentedAt: new Date().toISOString(),
      matchedCompanyIds: matchedCompanies.map((company) => company.id),
    }
    const applicantLogs = buildEmailLogs([applicant], store.companies)
    const next = { ...store, applicants: [applicant, ...store.applicants], emailLogs: [...applicantLogs, ...store.emailLogs] }
    save(next)
    setSelectedApplicantId(applicant.id)
    alert(`신청이 완료되었습니다. 접수번호: ${applicant.receiptNo}\n※ 실제 이메일은 발송되지 않고 로그로만 시뮬레이션됩니다.`)
  }

  function addCompany(company: Company) {
    save({ ...store, companies: [company, ...store.companies] })
  }

  return (
    <main>
      <header className="hero">
        <div>
          <p className="badge">내부 확인용 MVP · 테스트 데이터 전용</p>
          <h1>일자리 박람회 구직자-기업 자동 매칭 웹앱</h1>
          <p>구직자 신청, 업종 기준 자동 매칭, 이메일 발송 시뮬레이션, 관리자 대시보드를 한 화면에서 검증합니다.</p>
        </div>
        <nav>
          <button onClick={() => setView('apply')}>구직자 신청</button>
          <button onClick={() => setView(admin ? 'admin' : 'login')}>관리자</button>
          <button className="ghost" onClick={resetDemo}>테스트 데이터 초기화</button>
        </nav>
      </header>

      <section className="notice">
        <strong>공유 전 주의사항</strong>
        <ul>
          <li>이 주소는 내부 확인용 테스트 주소입니다.</li>
          <li>실제 개인정보, 실제 이력서, 실제 기업정보를 입력하지 마세요.</li>
          <li>이메일은 실제 발송되지 않으며 이메일 로그로만 시뮬레이션됩니다.</li>
          <li>관리자 계정은 검토자에게만 개별 공유하세요.</li>
        </ul>
      </section>

      {view === 'apply' && <ApplyPage onSubmit={handleApplicantSubmit} />}
      {view === 'login' && <LoginPage onLogin={handleLogin} error={loginError} />}
      {view === 'admin' && <AdminPage admin={admin} store={store} selectedApplicantId={selectedApplicantId} setSelectedApplicantId={setSelectedApplicantId} addCompany={addCompany} />}
    </main>
  )
}

function ApplyPage({ onSubmit }: { onSubmit: (draft: ApplicantDraft) => void }) {
  const [draft, setDraft] = useState<ApplicantDraft>({ name: '', birthDate: '', phone: '', email: '', jobCategory: '', resumeFileName: '', resumeFileSize: 0, privacyConsent: false })
  const [errors, setErrors] = useState<string[]>([])

  function submit(event: FormEvent) {
    event.preventDefault()
    const nextErrors = validateApplicantForm(draft)
    setErrors(nextErrors)
    if (nextErrors.length === 0) {
      onSubmit(draft)
      setDraft({ name: '', birthDate: '', phone: '', email: '', jobCategory: '', resumeFileName: '', resumeFileSize: 0, privacyConsent: false })
    }
  }

  return <section className="card"><h2>구직자 신청</h2><form className="grid" onSubmit={submit}>
    <label>이름 *<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="홍길동" /></label>
    <label>생년월일 *<input type="date" value={draft.birthDate} onChange={(e) => setDraft({ ...draft, birthDate: e.target.value })} /></label>
    <label>핸드폰번호 *<input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="010-0000-0000" /></label>
    <label>이메일 선택<input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="선택 입력" /></label>
    <label>구직업종 *<select value={draft.jobCategory} onChange={(e) => setDraft({ ...draft, jobCategory: e.target.value as ApplicantDraft['jobCategory'] })}><option value="">선택</option>{INDUSTRIES.map((industry) => <option key={industry}>{industry}</option>)}</select></label>
    <label>이력서 파일 *<input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => { const file = e.target.files?.[0]; setDraft({ ...draft, resumeFileName: file?.name ?? '', resumeFileSize: file?.size ?? 0 }) }} /><small>허용: jpg, png, pdf, word, ppt / 최대 10MB</small></label>
    <div className="consent"><strong>개인정보 수집·이용·제공 동의서 초안</strong><div className="scrollbox">
      <p>본인은 일자리 박람회 구직 신청 및 고용기업 매칭을 위해 개인정보가 수집·이용·제공되는 것에 동의합니다.</p>
      <p>수집 항목: 이름, 생년월일, 연락처, 선택 입력 이메일, 구직업종, 이력서 파일, 동의 여부 및 동의 일시.</p>
      <p>이용 목적: 구직 신청 접수, 고용기업 매칭, 기업 담당자 및 매칭 담당자에게 구직자 정보 전달, 신청 현황 관리.</p>
      <p>제공 대상: 구직업종과 고용업종이 일치하는 고용기업 담당자 및 매칭 담당자.</p>
      <p>제공 항목: 구직자가 입력한 정보 전체와 이력서 파일. 본 문안은 MVP 테스트용 초안이며 실제 운영 전 최종 검토가 필요합니다.</p>
    </div><label className="check"><input type="checkbox" checked={draft.privacyConsent} onChange={(e) => setDraft({ ...draft, privacyConsent: e.target.checked })} /> 위 개인정보 수집·이용·제공 내용에 동의합니다.</label></div>
    {errors.length > 0 && <div className="errors">{errors.map((error) => <p key={error}>• {error}</p>)}</div>}
    <button className="primary" type="submit">신청하기</button>
  </form></section>
}

function LoginPage({ onLogin, error }: { onLogin: (email: string, password: string) => void; error: string }) {
  const [email, setEmail] = useState('admin1@example.com')
  const [password, setPassword] = useState('test1234')
  return <section className="card narrow"><h2>관리자 로그인</h2><p>테스트 계정: admin1@example.com / test1234 또는 admin2@example.com / test1234</p><form onSubmit={(e) => { e.preventDefault(); onLogin(email, password) }} className="grid"><label>이메일<input value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>비밀번호<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="errors">{error}</p>}<button className="primary">로그인</button></form></section>
}

function AdminPage({ admin, store, selectedApplicantId, setSelectedApplicantId, addCompany }: { admin: string; store: Store; selectedApplicantId: string; setSelectedApplicantId: (id: string) => void; addCompany: (company: Company) => void }) {
  const stats = useMemo(() => buildDashboardStats(store.applicants), [store.applicants])
  const selected = store.applicants.find((applicant) => applicant.id === selectedApplicantId) ?? store.applicants[0]
  const selectedCompanies = store.companies.filter((company) => selected?.matchedCompanyIds.includes(company.id))
  return <section className="admin"><h2>관리자 대시보드 <span>{admin}</span></h2><div className="stats"><Stat label="구직신청 총인원" value={`${stats.totalApplicants}명`} /><Stat label="매칭 총인원" value={`${stats.totalMatched}명`} /><Stat label="미매칭 총인원" value={`${stats.totalUnmatched}명`} /></div>
    <div className="card"><h3>업종별 구직신청 총인원</h3><div className="chips">{INDUSTRIES.map((industry) => <span key={industry}>{industry}: {stats.byCategory[industry]}명</span>)}</div></div>
    <div className="columns"><div className="card"><h3>구직자 목록</h3><table><tbody>{store.applicants.map((applicant) => <tr key={applicant.id} onClick={() => setSelectedApplicantId(applicant.id)} className={selected?.id === applicant.id ? 'active' : ''}><td>{applicant.receiptNo}</td><td>{applicant.name}</td><td>{applicant.jobCategory}</td><td>{applicant.matchedCompanyIds.length}개 매칭</td></tr>)}</tbody></table></div>
    <div className="card"><h3>구직자 상세</h3>{selected && <><p><b>접수번호:</b> {selected.receiptNo}</p><p><b>이름:</b> {selected.name}</p><p><b>생년월일:</b> {selected.birthDate}</p><p><b>연락처:</b> {selected.phone}</p><p><b>이메일:</b> {selected.email || '미입력'}</p><p><b>이력서:</b> {selected.resumeFileName}</p><p><b>개인정보 동의:</b> 동의 / {new Date(selected.consentedAt).toLocaleString()}</p><h4>매칭 기업</h4>{selectedCompanies.length ? selectedCompanies.map((company) => <p key={company.id}>• {company.companyName} / {company.managerEmail}</p>) : <p>미매칭</p>}</>}</div></div>
    <div className="columns"><CompanyForm addCompany={addCompany} /><div className="card"><h3>이메일 발송 로그 시뮬레이션</h3><table><tbody>{store.emailLogs.slice(0, 16).map((log) => <tr key={log.id}><td>{log.recipientType}</td><td>{log.recipientEmail}</td><td>{log.applicantReceiptNo}</td><td>{log.attachmentFileName}</td><td>{log.status}</td></tr>)}</tbody></table></div></div>
  </section>
}
function Stat({ label, value }: { label: string; value: string }) { return <div className="stat"><span>{label}</span><strong>{value}</strong></div> }
function CompanyForm({ addCompany }: { addCompany: (company: Company) => void }) {
  const [company, setCompany] = useState({ companyName: '', businessNumber: '', industry: '제조업', managerName: '', managerEmail: '' })
  function submit(e: FormEvent) { e.preventDefault(); addCompany({ ...company, id: crypto.randomUUID(), industry: company.industry as Company['industry'] }); setCompany({ companyName: '', businessNumber: '', industry: '제조업', managerName: '', managerEmail: '' }) }
  return <div className="card"><h3>고용기업 직접 등록</h3><form className="grid" onSubmit={submit}><input required placeholder="회사명" value={company.companyName} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} /><input required placeholder="사업자등록번호" value={company.businessNumber} onChange={(e) => setCompany({ ...company, businessNumber: e.target.value })} /><select value={company.industry} onChange={(e) => setCompany({ ...company, industry: e.target.value })}>{INDUSTRIES.map((industry) => <option key={industry}>{industry}</option>)}</select><input required placeholder="담당자 이름" value={company.managerName} onChange={(e) => setCompany({ ...company, managerName: e.target.value })} /><input required type="email" placeholder="담당자 이메일" value={company.managerEmail} onChange={(e) => setCompany({ ...company, managerEmail: e.target.value })} /><button className="primary">기업 추가</button></form><p className="muted">CSV 일괄 업로드는 운영 버전에서 파일 파싱으로 확장 예정입니다.</p></div>
}

export default App
