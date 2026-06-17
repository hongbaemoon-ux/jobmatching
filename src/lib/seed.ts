import type { Applicant, Company, EmailLog, MatchingManager } from './types'
import { generateReceiptNo, getMatchedCompanies } from './rules'

export const managers: MatchingManager[] = [
  { id: 'm1', name: '매칭담당자 1', email: 'admin1@example.com', password: 'test1234' },
  { id: 'm2', name: '매칭담당자 2', email: 'admin2@example.com', password: 'test1234' },
]

export const seedCompanies: Company[] = [
  { id: 'c1', companyName: '한빛제조 주식회사', businessNumber: '101-81-00001', industry: '제조업', managerName: '김담당', managerEmail: 'company01@example.com' },
  { id: 'c2', companyName: '미래리테일', businessNumber: '102-82-00002', industry: '도소매', managerName: '이담당', managerEmail: 'company02@example.com' },
  { id: 'c3', companyName: '세움컨설팅', businessNumber: '103-83-00003', industry: '전문서비스', managerName: '박담당', managerEmail: 'company03@example.com' },
  { id: 'c4', companyName: '대성건설', businessNumber: '104-84-00004', industry: '건설', managerName: '최담당', managerEmail: 'company04@example.com' },
  { id: 'c5', companyName: '신뢰금융서비스', businessNumber: '105-85-00005', industry: '금융', managerName: '정담당', managerEmail: 'company05@example.com' },
  { id: 'c6', companyName: '해오름서비스', businessNumber: '106-86-00006', industry: '기타', managerName: '한담당', managerEmail: 'company06@example.com' },
  { id: 'c7', companyName: '태산테크', businessNumber: '107-87-00007', industry: '제조업', managerName: '오담당', managerEmail: 'company07@example.com' },
  { id: 'c8', companyName: '바로유통', businessNumber: '108-88-00008', industry: '도소매', managerName: '임담당', managerEmail: 'company08@example.com' },
  { id: 'c9', companyName: '다온파트너스', businessNumber: '109-89-00009', industry: '전문서비스', managerName: '윤담당', managerEmail: 'company09@example.com' },
  { id: 'c10', companyName: '튼튼종합건설', businessNumber: '110-80-00010', industry: '건설', managerName: '강담당', managerEmail: 'company10@example.com' },
]

const baseApplicants = [
  ['김민준', '1995-03-12', '010-1001-2001', 'minjun.test01@example.com', '제조업', 'resume_kim_minjun.pdf'],
  ['이서연', '1998-07-24', '010-1002-2002', 'seoyeon.test02@example.com', '도소매', 'resume_lee_seoyeon.docx'],
  ['박지훈', '1992-11-05', '010-1003-2003', 'jihun.test03@example.com', '전문서비스', 'resume_park_jihun.pdf'],
  ['최하은', '1999-01-18', '010-1004-2004', 'haeun.test04@example.com', '건설', 'resume_choi_haeun.pptx'],
  ['정우진', '1994-09-30', '010-1005-2005', 'woojin.test05@example.com', '금융', 'resume_jung_woojin.pdf'],
  ['한지아', '1997-05-16', '010-1006-2006', 'jia.test06@example.com', '기타', 'resume_han_jia.png'],
  ['오도윤', '1991-12-08', '010-1007-2007', 'doyoon.test07@example.com', '제조업', 'resume_oh_doyoon.pdf'],
  ['임수빈', '1996-04-21', '010-1008-2008', 'subin.test08@example.com', '도소매', 'resume_lim_subin.doc'],
  ['윤서준', '1993-08-14', '010-1009-2009', 'seojun.test09@example.com', '전문서비스', 'resume_yoon_seojun.pdf'],
  ['강예린', '2000-02-27', '010-1010-2010', 'yerin.test10@example.com', '건설', 'resume_kang_yerin.jpg'],
] as const

export const seedApplicants: Applicant[] = baseApplicants.map((row, index) => {
  const draft = {
    name: row[0], birthDate: row[1], phone: row[2], email: row[3], jobCategory: row[4], resumeFileName: row[5], resumeFileSize: 512000, privacyConsent: true,
  } as Applicant
  return {
    ...draft,
    id: `a${index + 1}`,
    receiptNo: generateReceiptNo('2026-06-17', index + 1),
    createdAt: `2026-06-17T09:${String(index).padStart(2, '0')}:00`,
    consentedAt: `2026-06-17T09:${String(index).padStart(2, '0')}:00`,
    matchedCompanyIds: getMatchedCompanies(draft, seedCompanies).map((company) => company.id),
  }
})

export function buildEmailLogs(applicants: Applicant[], companies: Company[]): EmailLog[] {
  return applicants.flatMap((applicant) => {
    const matchedCompanies = companies.filter((company) => applicant.matchedCompanyIds.includes(company.id))
    const companyLogs = matchedCompanies.map((company) => ({
      id: `log-${applicant.id}-${company.id}`,
      createdAt: applicant.createdAt,
      recipientType: '기업 담당자' as const,
      recipientName: `${company.companyName} ${company.managerName}`,
      recipientEmail: company.managerEmail,
      applicantReceiptNo: applicant.receiptNo,
      subject: `[일자리 박람회] 신규 구직자 매칭 안내 - ${applicant.jobCategory}`,
      body: `${applicant.name}님의 구직자 정보와 이력서 첨부파일을 전달하는 이메일 시뮬레이션입니다.`,
      attachmentFileName: applicant.resumeFileName,
      status: '시뮬레이션 완료' as const,
    }))
    const managerLogs = managers.map((manager) => ({
      id: `log-${applicant.id}-${manager.id}`,
      createdAt: applicant.createdAt,
      recipientType: '매칭 담당자' as const,
      recipientName: manager.name,
      recipientEmail: manager.email,
      applicantReceiptNo: applicant.receiptNo,
      subject: '[일자리 박람회] 신규 구직자 등록 및 매칭 결과 안내',
      body: `${applicant.name}님의 등록 정보와 매칭 결과를 전달하는 이메일 시뮬레이션입니다.`,
      attachmentFileName: applicant.resumeFileName,
      status: '시뮬레이션 완료' as const,
    }))
    return [...companyLogs, ...managerLogs]
  })
}
