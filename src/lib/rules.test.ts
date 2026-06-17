import { describe, expect, it } from 'vitest'
import { buildDashboardStats, generateReceiptNo, getMatchedCompanies, validateApplicantForm } from './rules'
import type { Applicant, ApplicantDraft, Company } from './types'

const companies: Company[] = [
  { id: 'c1', companyName: '한빛제조', businessNumber: '101-81-00001', industry: '제조업', managerName: '김담당', managerEmail: 'c1@example.com' },
  { id: 'c2', companyName: '미래리테일', businessNumber: '102-82-00002', industry: '도소매', managerName: '이담당', managerEmail: 'c2@example.com' },
  { id: 'c3', companyName: '태산테크', businessNumber: '107-87-00007', industry: '제조업', managerName: '오담당', managerEmail: 'c3@example.com' },
]

const validDraft: ApplicantDraft = {
  name: '김민준',
  birthDate: '1995-03-12',
  phone: '010-1001-2001',
  email: '',
  jobCategory: '제조업',
  resumeFileName: 'resume.pdf',
  resumeFileSize: 1024,
  privacyConsent: true,
}

describe('job matching rules', () => {
  it('matches companies when applicant job category equals company industry', () => {
    const matched = getMatchedCompanies(validDraft, companies)
    expect(matched.map((company) => company.id)).toEqual(['c1', 'c3'])
  })

  it('validates required fields, consent, file type, and 10MB limit', () => {
    expect(validateApplicantForm(validDraft)).toEqual([])
    expect(validateApplicantForm({ ...validDraft, privacyConsent: false })).toContain('개인정보 수집·이용·제공 동의가 필요합니다.')
    expect(validateApplicantForm({ ...validDraft, resumeFileName: 'resume.exe' })).toContain('허용되지 않은 이력서 파일 형식입니다.')
    expect(validateApplicantForm({ ...validDraft, resumeFileSize: 10 * 1024 * 1024 + 1 })).toContain('이력서 파일은 10MB 이하만 업로드할 수 있습니다.')
  })

  it('generates receipt number using JOB-YYYYMMDD-0001 format', () => {
    expect(generateReceiptNo('2026-06-17', 1)).toBe('JOB-20260617-0001')
    expect(generateReceiptNo('2026-06-17', 23)).toBe('JOB-20260617-0023')
  })

  it('builds dashboard stats including totals, matched, unmatched, and by-category counts', () => {
    const applicants: Applicant[] = [
      { ...validDraft, jobCategory: '제조업', id: 'a1', receiptNo: 'JOB-20260617-0001', createdAt: '2026-06-17T09:00:00', matchedCompanyIds: ['c1'], consentedAt: '2026-06-17T09:00:00' },
      { ...validDraft, jobCategory: '금융', id: 'a2', receiptNo: 'JOB-20260617-0002', createdAt: '2026-06-17T09:01:00', matchedCompanyIds: [], consentedAt: '2026-06-17T09:01:00' },
    ]
    expect(buildDashboardStats(applicants)).toMatchObject({
      totalApplicants: 2,
      totalMatched: 1,
      totalUnmatched: 1,
      byCategory: { 제조업: 1, 금융: 1 },
    })
  })
})
