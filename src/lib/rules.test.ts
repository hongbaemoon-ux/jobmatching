import { describe, expect, it } from 'vitest'
import { buildDashboardStats, generateReceiptNo, getSameJobCompanies, getSelectedCompanies, validateApplicantForm } from './rules'
import type { Applicant, ApplicantDraft, Company } from './types'

const companies: Company[] = [
  { id: 'c1', companyName: '한빛물류', businessNumber: '101-81-00001', industry: '물류', jobCategory: '물류/운수', recruitmentPart: '물류센터 입출고', addressDistrict: '김포시', postingSummary: '김포시 근무', postingUrl: 'https://example.com/1', managerName: '김담당', managerEmail: 'c1@example.com' },
  { id: 'c2', companyName: '미래케어', businessNumber: '102-82-00002', industry: '보건복지', jobCategory: '보건/돌봄', recruitmentPart: '요양보호사', addressDistrict: '부천시', postingSummary: '부천시 근무', postingUrl: 'https://example.com/2', managerName: '이담당', managerEmail: 'c2@example.com' },
  { id: 'c3', companyName: '태산운수', businessNumber: '107-87-00007', industry: '운수', jobCategory: '물류/운수', recruitmentPart: '배송기사', addressDistrict: '광명시', postingSummary: '광명시 근무', postingUrl: 'https://example.com/3', managerName: '오담당', managerEmail: 'c3@example.com' },
]

const validDraft: ApplicantDraft = {
  name: '김민준',
  birthDate: '1965-03-12',
  phone: '010-1001-2001',
  email: '',
  jobCategory: '물류/운수',
  selectedCompanyIds: ['c1', 'c3'],
  resumeFileName: 'resume.pdf',
  resumeFileSize: 1024,
  privacyConsent: true,
}

describe('job matching rules', () => {
  it('shows same-job postings based on selected external posting', () => {
    const matched = getSameJobCompanies(companies[0], companies)
    expect(matched.map((company) => company.id)).toEqual(['c1', 'c3'])
  })

  it('returns only companies checked by applicant for resume delivery', () => {
    const selected = getSelectedCompanies(validDraft, companies)
    expect(selected.map((company) => company.id)).toEqual(['c1', 'c3'])
  })

  it('validates required fields, selected companies, consent, file type, and 10MB limit', () => {
    expect(validateApplicantForm(validDraft)).toEqual([])
    expect(validateApplicantForm({ ...validDraft, selectedCompanyIds: [] })).toContain('이력서를 접수할 기업을 1개 이상 선택해야 합니다.')
    expect(validateApplicantForm({ ...validDraft, privacyConsent: false })).toContain('개인정보 수집·이용·제공 동의가 필요합니다.')
    expect(validateApplicantForm({ ...validDraft, resumeFileName: 'resume.exe' })).toContain('허용되지 않은 이력서 파일 형식입니다.')
    expect(validateApplicantForm({ ...validDraft, resumeFileSize: 10 * 1024 * 1024 + 1 })).toContain('이력서 파일은 10MB 이하만 업로드할 수 있습니다.')
  })

  it('generates receipt number using JOB-YYYYMMDD-0001 format', () => {
    expect(generateReceiptNo('2026-06-17', 1)).toBe('JOB-20260617-0001')
    expect(generateReceiptNo('2026-06-17', 23)).toBe('JOB-20260617-0023')
  })

  it('builds dashboard stats by job category', () => {
    const applicants: Applicant[] = [
      { ...validDraft, jobCategory: '물류/운수', id: 'a1', receiptNo: 'JOB-20260617-0001', createdAt: '2026-06-17T09:00:00', matchedCompanyIds: ['c1'], consentedAt: '2026-06-17T09:00:00' },
      { ...validDraft, jobCategory: '보건/돌봄', id: 'a2', receiptNo: 'JOB-20260617-0002', createdAt: '2026-06-17T09:01:00', matchedCompanyIds: [], consentedAt: '2026-06-17T09:01:00' },
    ]
    expect(buildDashboardStats(applicants)).toMatchObject({
      totalApplicants: 2,
      totalMatched: 1,
      totalUnmatched: 1,
      byCategory: { '물류/운수': 1, '보건/돌봄': 1 },
    })
  })
})
