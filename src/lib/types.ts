export const INDUSTRIES = ['제조업', '도소매', '전문서비스', '건설', '금융', '기타'] as const
export type Industry = (typeof INDUSTRIES)[number]

export type ApplicantDraft = {
  name: string
  birthDate: string
  phone: string
  email?: string
  jobCategory: Industry | ''
  resumeFileName: string
  resumeFileSize: number
  privacyConsent: boolean
}

export type Applicant = ApplicantDraft & {
  id: string
  receiptNo: string
  jobCategory: Industry
  createdAt: string
  consentedAt: string
  matchedCompanyIds: string[]
}

export type Company = {
  id: string
  companyName: string
  businessNumber: string
  industry: Industry
  managerName: string
  managerEmail: string
}

export type MatchingManager = {
  id: string
  name: string
  email: string
  password: string
}

export type EmailLog = {
  id: string
  createdAt: string
  recipientType: '기업 담당자' | '매칭 담당자'
  recipientName: string
  recipientEmail: string
  applicantReceiptNo: string
  subject: string
  body: string
  attachmentFileName: string
  status: '시뮬레이션 완료'
}

export type DashboardStats = {
  totalApplicants: number
  totalMatched: number
  totalUnmatched: number
  byCategory: Record<Industry, number>
}
