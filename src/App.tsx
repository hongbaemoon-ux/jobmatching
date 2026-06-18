import { useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import './App.css'
import { buildDashboardStats, generateReceiptNo, getSameJobCompanies, getSelectedCompanies, validateApplicantForm } from './lib/rules'
import { buildEmailLogs, managers, seedApplicants, seedCompanies } from './lib/seed'
import { JOB_CATEGORIES } from './lib/types'
import type { Applicant, ApplicantDraft, Company, EmailLog, GyeonggiDistrict } from './lib/types'

const storageKey = 'jobmatching-mvp-v2'

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

function getInitialPostingId(companies: Company[]) {
  const params = new URLSearchParams(window.location.search)
  return params.get('postingId') || params.get('companyId') || companies[0]?.id || ''
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
    const selectedCompanies = getSelectedCompanies(draft, store.companies)
    const applicant: Applicant = {
      ...draft,
      jobCategory: draft.jobCategory as Applicant['jobCategory'],
      id: crypto.randomUUID(),
      receiptNo: generateReceiptNo(today, todayCount + 1),
      createdAt: new Date().toISOString(),
      consentedAt: new Date().toISOString(),
      matchedCompanyIds: selectedCompanies.map((company) => company.id),
    }
    const applicantLogs = buildEmailLogs([applicant], store.companies)
    const next = { ...store, applicants: [applicant, ...store.applicants], emailLogs: [...applicantLogs, ...store.emailLogs] }
    save(next)
    setSelectedApplicantId(applicant.id)
    alert(`신청이 완료되었습니다. 접수번호: ${applicant.receiptNo}\n선택 기업 ${selectedCompanies.length}곳에 이력서 이메일 발송 로그가 생성되었습니다.\n※ 실제 이메일은 발송되지 않고 로그로만 시뮬레이션됩니다.`)
  }

  function addCompany(company: Company) {
    save({ ...store, companies: [company, ...store.companies] })
  }

  return (
    <main>
      <header className="hero">
        <div>
          <p className="badge">내부 확인용 MVP · 테스트 데이터 전용</p>
          <h1>일자리 박람회 이력서 사전 접수 웹앱</h1>
          <p>외부 홈페이지에서 선택한 공고를 기준으로 같은 직무의 다른 공고를 제안하고, 선택 기업 담당자에게 이력서 이메일 발송을 시뮬레이션합니다.</p>
        </div>
        <nav>
          <button onClick={() => setView('apply')}>구직자 신청</button>
          <button onClick={() => setView(admin ? 'admin' : 'login')}>관리자</button>
          <button className="ghost" onClick={resetDemo}>테스트 데이터 초기화</button>
        </nav>
      </header>

      <section className="notice">
        <strong>검증 흐름</strong>
        <ul>
          <li>외부 홈페이지에서 기업 공고 열람 후 ‘이력서 사전 접수’를 클릭했다고 가정합니다.</li>
          <li>이 웹앱에서는 이미 선택한 기업이 자동 체크되고, 같은 직무의 다른 공고가 함께 표시됩니다.</li>
          <li>공고 전문은 웹앱에 담지 않고 ‘원본 공고 보기’ 링크로 외부 홈페이지 새 창을 엽니다.</li>
          <li>실제 개인정보, 실제 이력서, 실제 기업정보를 입력하지 마세요.</li>
        </ul>
      </section>

      {view === 'apply' && <ApplyPage companies={store.companies} onSubmit={handleApplicantSubmit} />}
      {view === 'login' && <LoginPage onLogin={handleLogin} error={loginError} />}
      {view === 'admin' && <AdminPage admin={admin} store={store} selectedApplicantId={selectedApplicantId} setSelectedApplicantId={setSelectedApplicantId} addCompany={addCompany} />}
    </main>
  )
}

function ApplyPage({ companies, onSubmit }: { companies: Company[]; onSubmit: (draft: ApplicantDraft) => void }) {
  const initialPostingId = getInitialPostingId(companies)
  const initialCompany = companies.find((company) => company.id === initialPostingId) ?? companies[0]
  const [selectedCompanyIds, setSelectedCompanyIds] = useState<string[]>(initialCompany ? [initialCompany.id] : [])
  const [draft, setDraft] = useState<ApplicantDraft>({ name: '', birthDate: '', phone: '', email: '', jobCategory: initialCompany?.jobCategory ?? '', selectedCompanyIds: initialCompany ? [initialCompany.id] : [], resumeFileName: '', resumeFileSize: 0, privacyConsent: false })
  const [errors, setErrors] = useState<string[]>([])
  const selectedCompany = companies.find((company) => company.id === selectedCompanyIds[0]) ?? initialCompany
  const sameJobCompanies = getSameJobCompanies(selectedCompany, companies)

  function toggleCompany(companyId: string, checked: boolean) {
    const next = checked ? Array.from(new Set([...selectedCompanyIds, companyId])) : selectedCompanyIds.filter((id) => id !== companyId)
    setSelectedCompanyIds(next)
    setDraft({ ...draft, selectedCompanyIds: next })
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    const nextDraft = { ...draft, jobCategory: selectedCompany?.jobCategory ?? '', selectedCompanyIds }
    const nextErrors = validateApplicantForm(nextDraft)
    setErrors(nextErrors)
    if (nextErrors.length === 0) {
      onSubmit(nextDraft)
      const resetSelection = selectedCompany ? [selectedCompany.id] : []
      setSelectedCompanyIds(resetSelection)
      setDraft({ name: '', birthDate: '', phone: '', email: '', jobCategory: selectedCompany?.jobCategory ?? '', selectedCompanyIds: resetSelection, resumeFileName: '', resumeFileSize: 0, privacyConsent: false })
    }
  }

  return <section className="card"><h2>이력서 사전 접수</h2>
    {selectedCompany && <div className="selected-posting"><strong>외부 홈페이지에서 선택한 공고</strong><p>{selectedCompany.companyName} / {selectedCompany.recruitmentPart} / {selectedCompany.addressDistrict}</p><p className="muted">처음 선택한 기업은 자동 선택되어 있습니다. 원하지 않으면 해제할 수 있으며, 체크된 기업에만 이력서가 전달됩니다.</p></div>}
    <div className="card inner"><h3>같은 직무의 다른 채용공고</h3><p className="muted">직무: {selectedCompany?.jobCategory ?? '-'} · 공고 전문은 원본 공고 링크에서 확인합니다.</p><div className="posting-list">
      {sameJobCompanies.map((company) => <article key={company.id} className="posting-item">
        <label className="check"><input type="checkbox" checked={selectedCompanyIds.includes(company.id)} onChange={(e) => toggleCompany(company.id, e.target.checked)} /> <b>{company.companyName}</b>{company.id === selectedCompany?.id && <span className="pill">자동 선택</span>}</label>
        <p>모집부문: {company.recruitmentPart}</p>
        <p>근무지역: 경기도 {company.addressDistrict}</p>
        <p className="muted">{company.postingSummary}</p>
        <a href={company.postingUrl} target="_blank" rel="noreferrer">원본 채용공고 보기</a>
      </article>)}
    </div></div>
    <form className="grid" onSubmit={submit}>
      <label>이름 *<input value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="홍길동" /></label>
      <label>생년월일 *<input type="date" value={draft.birthDate} onChange={(e) => setDraft({ ...draft, birthDate: e.target.value })} /></label>
      <label>핸드폰번호 *<input value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} placeholder="010-0000-0000" /></label>
      <label>이메일 선택<input type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="선택 입력" /></label>
      <label>이력서 파일 *<input type="file" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx" onChange={(e) => { const file = e.target.files?.[0]; setDraft({ ...draft, resumeFileName: file?.name ?? '', resumeFileSize: file?.size ?? 0 }) }} /><small>허용: jpg, png, pdf, word, ppt / 최대 10MB</small></label>
      <div className="consent"><strong>개인정보 수집·이용·제공에 관한 동의서</strong><div className="scrollbox">
        <p>주식회사 상상우리(경기도 5070 일자리박람회 운영사)는 채용 검토를 위해 해당 채용처에 귀하의 이력서를 제공할 예정입니다. 이에 따라『개인정보 보호법』 제17조 및 관련 법령에 따라 아래와 같이 개인정보 제3자 제공에 대한 동의를 받고자 합니다.</p>
        <p>○ 제공받는 자<br />- 채용을 진행하는 협력사</p>
        <p>□ 수집 및 이용 목적<br />- 채용 적합성 검토<br />- 면접 등 채용 전형 안내</p>
        <p>□ 수집 ‧ 이용 항목<br />- 이력서 및 지원서상 기재된 모든 항목<br />&nbsp;(성명, 생년월일, 연락처, 학력, 경력 등)</p>
        <p>□ 보유 ‧ 이용기간<br />- 사업 종료 후 3년</p>
        <p>□ 동의 거부 권리 및 거부 시 불이익<br />- 귀하는 개인정보 제공에 동의하지 않을 권리가 있습니다.<br />- 동의하지 않으실 경우 이력서 사전 제출을 통한 채용 절차에 제한이 있을 수 있습니다.</p>
      </div><label className="check"><input type="checkbox" checked={draft.privacyConsent} onChange={(e) => setDraft({ ...draft, privacyConsent: e.target.checked })} /> 위 개인정보 수집·이용·제공 내용에 동의합니다.</label></div>
      {errors.length > 0 && <div className="errors">{errors.map((error) => <p key={error}>• {error}</p>)}</div>}
      <button className="primary" type="submit">선택 기업에 이력서 사전 접수</button>
    </form></section>
}

function LoginPage({ onLogin, error }: { onLogin: (email: string, password: string) => void; error: string }) {
  const [email, setEmail] = useState('admin1@example.com')
  const [password, setPassword] = useState('test1234')
  return <section className="card narrow"><h2>관리자 로그인</h2><p>테스트 계정: admin1@example.com / test1234 또는 admin2@example.com / test1234</p><form onSubmit={(e) => { e.preventDefault(); onLogin(email, password) }} className="grid"><label>이메일<input value={email} onChange={(e) => setEmail(e.target.value)} /></label><label>비밀번호<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></label>{error && <p className="errors">{error}</p>}<button className="primary">로그인</button></form></section>
}

function AdminPage({ admin, store, selectedApplicantId, setSelectedApplicantId, addCompany }: { admin: string; store: Store; selectedApplicantId: string; setSelectedApplicantId: (id: string) => void; addCompany: (company: Company) => void }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'job' | 'company' | 'applicant' | 'email' | 'posting'>('overview')
  const stats = useMemo(() => buildDashboardStats(store.applicants), [store.applicants])
  const selected = store.applicants.find((applicant) => applicant.id === selectedApplicantId) ?? store.applicants[0]
  const selectedCompanies = store.companies.filter((company) => selected?.matchedCompanyIds.includes(company.id))
  const today = new Date().toISOString().slice(0, 10)
  const todayApplicants = store.applicants.filter((applicant) => applicant.createdAt.startsWith(today)).length
  const totalCompanySelections = store.applicants.reduce((sum, applicant) => sum + applicant.matchedCompanyIds.length, 0)
  const averageSelections = store.applicants.length ? (totalCompanySelections / store.applicants.length).toFixed(1) : '0.0'
  const companyRows = store.companies.map((company) => {
    const relatedApplicants = store.applicants.filter((applicant) => applicant.matchedCompanyIds.includes(company.id))
    const latest = relatedApplicants.map((applicant) => applicant.createdAt).sort().at(-1)
    return { company, count: relatedApplicants.length, latest }
  }).sort((a, b) => b.count - a.count)
  const jobRows = JOB_CATEGORIES.map((category) => {
    const applicants = store.applicants.filter((applicant) => applicant.jobCategory === category)
    const selectedCount = applicants.reduce((sum, applicant) => sum + applicant.matchedCompanyIds.length, 0)
    const companyCount = store.companies.filter((company) => company.jobCategory === category).length
    return { category, applicantCount: applicants.length, selectedCount, companyCount, average: applicants.length ? (selectedCount / applicants.length).toFixed(1) : '0.0' }
  })
  const tabs = [
    ['overview', '핵심현황'], ['job', '직무별 현황'], ['company', '기업별 현황'], ['applicant', '구직자별 상세'], ['email', '이메일 발송 로그'], ['posting', '원본 공고 연결 관리'],
  ] as const

  return <section className="admin"><h2>관리자 대시보드 <span>{admin}</span></h2>
    <div className="tabbar">{tabs.map(([key, label]) => <button key={key} className={activeTab === key ? 'active-tab' : ''} onClick={() => setActiveTab(key)}>{label}</button>)}</div>

    {activeTab === 'overview' && <div className="tab-panel">
      <div className="stats"><Stat label="총 이력서 사전 접수" value={`${stats.totalApplicants}건`} /><Stat label="오늘 접수" value={`${todayApplicants}건`} /><Stat label="선택된 기업 총합" value={`${totalCompanySelections}건`} /><Stat label="평균 선택 기업 수" value={`${averageSelections}개`} /></div>
      <div className="columns"><div className="card"><h3>직무별 접수 요약</h3><div className="chips">{JOB_CATEGORIES.map((category) => <span key={category}>{category}: {stats.byCategory[category]}명</span>)}</div></div>
      <div className="card"><h3>기업별 접수 상위 5개</h3>{companyRows.slice(0, 5).map(({ company, count }) => <p key={company.id}>• {company.companyName} / {company.recruitmentPart}: {count}건</p>)}<p className="muted">이메일 발송 로그: {store.emailLogs.length}건</p></div></div>
    </div>}

    {activeTab === 'job' && <div className="card tab-panel"><h3>직무별 현황</h3><table><tbody>{jobRows.map((row) => <tr key={row.category}><td>{row.category}</td><td>접수자 {row.applicantCount}명</td><td>선택 기업 {row.selectedCount}건</td><td>참여 기업 {row.companyCount}개</td><td>평균 선택 {row.average}개</td></tr>)}</tbody></table></div>}

    {activeTab === 'company' && <div className="card tab-panel"><h3>기업별 현황</h3><table><tbody>{companyRows.map(({ company, count, latest }) => <tr key={company.id}><td>{company.companyName}</td><td>{company.jobCategory}</td><td>{company.recruitmentPart}</td><td>{company.addressDistrict}</td><td>{count}건</td><td>{company.managerEmail}</td><td>{latest ? new Date(latest).toLocaleString() : '-'}</td><td><a href={company.postingUrl} target="_blank" rel="noreferrer">원본</a></td></tr>)}</tbody></table></div>}

    {activeTab === 'applicant' && <div className="columns tab-panel"><div className="card"><h3>구직자 목록</h3><table><tbody>{store.applicants.map((applicant) => <tr key={applicant.id} onClick={() => setSelectedApplicantId(applicant.id)} className={selected?.id === applicant.id ? 'active' : ''}><td>{applicant.receiptNo}</td><td>{applicant.name}</td><td>{applicant.jobCategory}</td><td>{applicant.matchedCompanyIds.length}개 기업</td></tr>)}</tbody></table></div>
    <div className="card"><h3>구직자 상세</h3>{selected && <><p><b>접수번호:</b> {selected.receiptNo}</p><p><b>이름:</b> {selected.name}</p><p><b>생년월일:</b> {selected.birthDate}</p><p><b>연락처:</b> {selected.phone}</p><p><b>이메일:</b> {selected.email || '미입력'}</p><p><b>직무:</b> {selected.jobCategory}</p><p><b>주소:</b> 경기도 {selected.addressDistrict || '-'}</p><p><b>이력서:</b> {selected.resumeFileName}</p><p><b>개인정보 동의:</b> 동의 / {new Date(selected.consentedAt).toLocaleString()}</p><h4>이력서 발송 대상 기업</h4>{selectedCompanies.length ? selectedCompanies.map((company) => <p key={company.id}>• {company.companyName} / {company.recruitmentPart} / {company.addressDistrict} / {company.managerEmail}</p>) : <p>미선택</p>}</>}</div></div>}

    {activeTab === 'email' && <div className="card tab-panel"><h3>이메일 발송 로그 시뮬레이션</h3><table><tbody>{store.emailLogs.map((log) => <tr key={log.id}><td>{new Date(log.createdAt).toLocaleString()}</td><td>{log.recipientType}</td><td>{log.recipientName}</td><td>{log.recipientEmail}</td><td>{log.applicantReceiptNo}</td><td>{log.attachmentFileName}</td><td>{log.status}</td></tr>)}</tbody></table></div>}

    {activeTab === 'posting' && <div className="columns tab-panel"><div className="card"><h3>원본 공고 연결 관리</h3><table><tbody>{companyRows.map(({ company, count }) => <tr key={company.id}><td>{company.id}</td><td>{company.companyName}</td><td>{company.jobCategory}</td><td>{company.recruitmentPart}</td><td>{company.addressDistrict}</td><td>게시중</td><td>{count}건</td><td><a href={company.postingUrl} target="_blank" rel="noreferrer">원본 공고</a></td></tr>)}</tbody></table></div><CompanyForm addCompany={addCompany} /></div>}
  </section>
}
function Stat({ label, value }: { label: string; value: string }) { return <div className="stat"><span>{label}</span><strong>{value}</strong></div> }
function CompanyForm({ addCompany }: { addCompany: (company: Company) => void }) {
  const [company, setCompany] = useState({ companyName: '', businessNumber: '', industry: '기타서비스', jobCategory: '기타', recruitmentPart: '', addressDistrict: '성남시', postingSummary: '', postingUrl: '', managerName: '', managerEmail: '' })
  function submit(e: FormEvent) { e.preventDefault(); addCompany({ ...company, id: crypto.randomUUID(), industry: company.industry as Company['industry'], jobCategory: company.jobCategory as Company['jobCategory'], addressDistrict: company.addressDistrict as GyeonggiDistrict }); setCompany({ companyName: '', businessNumber: '', industry: '기타서비스', jobCategory: '기타', recruitmentPart: '', addressDistrict: '성남시', postingSummary: '', postingUrl: '', managerName: '', managerEmail: '' }) }
  return <div className="card"><h3>고용기업 직접 등록</h3><form className="grid" onSubmit={submit}><input required placeholder="회사명" value={company.companyName} onChange={(e) => setCompany({ ...company, companyName: e.target.value })} /><input required placeholder="사업자등록번호" value={company.businessNumber} onChange={(e) => setCompany({ ...company, businessNumber: e.target.value })} /><select value={company.jobCategory} onChange={(e) => setCompany({ ...company, jobCategory: e.target.value })}>{JOB_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select><input required placeholder="모집부문" value={company.recruitmentPart} onChange={(e) => setCompany({ ...company, recruitmentPart: e.target.value })} /><input required placeholder="시·군·구" value={company.addressDistrict} onChange={(e) => setCompany({ ...company, addressDistrict: e.target.value })} /><input required placeholder="원본 공고 URL" value={company.postingUrl} onChange={(e) => setCompany({ ...company, postingUrl: e.target.value })} /><input required placeholder="담당자 이름" value={company.managerName} onChange={(e) => setCompany({ ...company, managerName: e.target.value })} /><input required type="email" placeholder="담당자 이메일" value={company.managerEmail} onChange={(e) => setCompany({ ...company, managerEmail: e.target.value })} /><button className="primary">기업 추가</button></form><p className="muted">CSV 일괄 업로드는 운영 버전에서 파일 파싱으로 확장 예정입니다.</p></div>
}

export default App
