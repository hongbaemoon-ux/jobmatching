export const JOB_CATEGORIES = ['물류/운수', '보건/돌봄', '시설/보안', '제조/생산', '영업/판매', '교육/사무', '조리/미화', '기타'] as const
export type JobCategory = (typeof JOB_CATEGORIES)[number]

export const INDUSTRIES = ['물류', '운수', '보건복지', '시설관리', '보안', '제조업', '유통', '교육서비스', '사무지원', '외식', '환경미화', '기타서비스'] as const
export type Industry = (typeof INDUSTRIES)[number]

export const GYEONGGI_DISTRICTS = ['김포시', '부천시', '광명시', '안양시', '시흥시', '안산시', '수원시', '화성시', '성남시'] as const
export type GyeonggiDistrict = (typeof GYEONGGI_DISTRICTS)[number]

export type ApplicantDraft = {
  name: string
  birthDate: string
  phone: string
  email?: string
  jobCategory: JobCategory | ''
  addressDistrict?: GyeonggiDistrict
  selectedCompanyIds: string[]
  resumeFileName: string
  resumeFileSize: number
  privacyConsent: boolean
}

export type Applicant = ApplicantDraft & {
  id: string
  receiptNo: string
  jobCategory: JobCategory
  createdAt: string
  consentedAt: string
  matchedCompanyIds: string[]
}

export type Company = {
  id: string
  companyName: string
  businessNumber: string
  industry: Industry
  jobCategory: JobCategory
  recruitmentPart: string
  addressDistrict: GyeonggiDistrict
  postingSummary: string
  postingUrl: string
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
  byCategory: Record<JobCategory, number>
}
