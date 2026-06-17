import { INDUSTRIES } from './types'
import type { Applicant, ApplicantDraft, Company, DashboardStats } from './types'

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'ppt', 'pptx']
const MAX_RESUME_BYTES = 10 * 1024 * 1024

export function getFileExtension(fileName: string) {
  return fileName.split('.').pop()?.toLowerCase() ?? ''
}

export function validateApplicantForm(draft: ApplicantDraft): string[] {
  const errors: string[] = []
  if (!draft.name.trim()) errors.push('이름은 필수입니다.')
  if (!draft.birthDate) errors.push('생년월일은 필수입니다.')
  if (!draft.phone.trim()) errors.push('핸드폰번호는 필수입니다.')
  if (!draft.jobCategory) errors.push('구직업종은 필수입니다.')
  if (!draft.resumeFileName) errors.push('이력서 파일은 필수입니다.')
  if (draft.resumeFileName && !ALLOWED_EXTENSIONS.includes(getFileExtension(draft.resumeFileName))) {
    errors.push('허용되지 않은 이력서 파일 형식입니다.')
  }
  if (draft.resumeFileSize > MAX_RESUME_BYTES) errors.push('이력서 파일은 10MB 이하만 업로드할 수 있습니다.')
  if (!draft.privacyConsent) errors.push('개인정보 수집·이용·제공 동의가 필요합니다.')
  if (draft.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)) errors.push('이메일 형식이 올바르지 않습니다.')
  return errors
}

export function getMatchedCompanies(applicant: Pick<ApplicantDraft, 'jobCategory'>, companies: Company[]) {
  return companies.filter((company) => company.industry === applicant.jobCategory)
}

export function generateReceiptNo(date: string, dailySequence: number) {
  const compactDate = date.replaceAll('-', '')
  return `JOB-${compactDate}-${String(dailySequence).padStart(4, '0')}`
}

export function buildDashboardStats(applicants: Applicant[]): DashboardStats {
  const byCategory = Object.fromEntries(INDUSTRIES.map((industry) => [industry, 0])) as DashboardStats['byCategory']
  applicants.forEach((applicant) => {
    byCategory[applicant.jobCategory] += 1
  })
  return {
    totalApplicants: applicants.length,
    totalMatched: applicants.filter((applicant) => applicant.matchedCompanyIds.length > 0).length,
    totalUnmatched: applicants.filter((applicant) => applicant.matchedCompanyIds.length === 0).length,
    byCategory,
  }
}
