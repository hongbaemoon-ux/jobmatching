const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'Hermes Agent';
pptx.subject = 'jobmatching MVP 작업경과와 회고';
pptx.title = 'jobmatching MVP 작업경과 공유';
pptx.company = '상상우리';
pptx.lang = 'ko-KR';
pptx.theme = {
  headFontFace: 'Malgun Gothic',
  bodyFontFace: 'Malgun Gothic',
  lang: 'ko-KR'
};
pptx.defineLayout({ name: 'CUSTOM_WIDE', width: 13.333, height: 7.5 });
pptx.layout = 'CUSTOM_WIDE';
pptx.margin = 0;
pptx.slideWidth = 13.333;
pptx.slideHeight = 7.5;
pptx.defineSlideMaster({
  title: 'MASTER',
  background: { color: 'F7F9FC' },
  objects: [
    { rect: { x: 0, y: 7.18, w: 13.333, h: 0.32, fill: { color: '0F2A43' }, line: { color: '0F2A43' } } },
  ],
  slideNumber: { x: 12.25, y: 7.22, color: 'FFFFFF', fontFace: 'Malgun Gothic', fontSize: 8 }
});

const C = {
  navy: '0F2A43',
  blue: '176B87',
  teal: '64CCC5',
  mint: 'DAFFFB',
  cream: 'F7F9FC',
  ink: '17202A',
  gray: '5C6670',
  red: 'B85042',
  yellow: 'F4B942',
  green: '2C7A5B',
  white: 'FFFFFF'
};
const font = 'Malgun Gothic';

function addTitle(slide, title, subtitle) {
  slide.addText(title, { x: 0.62, y: 0.35, w: 9.8, h: 0.48, fontFace: font, fontSize: 23, bold: true, color: C.navy, margin: 0 });
  if (subtitle) slide.addText(subtitle, { x: 0.65, y: 0.88, w: 10.9, h: 0.28, fontFace: font, fontSize: 9.5, color: C.gray, margin: 0 });
}
function addFooter(slide, text='jobmatching MVP 작업경과 공유') {
  slide.addText(text, { x: 0.62, y: 7.23, w: 5.5, h: 0.15, fontFace: font, fontSize: 7.5, color: C.white, margin: 0 });
}
function card(slide, x, y, w, h, title, body, opts={}) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w, h, rectRadius: 0.08, fill: { color: opts.fill || C.white }, line: { color: opts.line || 'E0E8F0', transparency: 0 }, shadow: opts.shadow === false ? undefined : { type: 'outer', color: 'D9E2EC', opacity: 0.22, blur: 1.5, angle: 45, distance: 1 } });
  slide.addText(title, { x: x+0.18, y: y+0.15, w: w-0.36, h: 0.27, fontFace: font, fontSize: opts.titleSize || 12, bold: true, color: opts.titleColor || C.navy, margin: 0 });
  slide.addText(body, { x: x+0.18, y: y+0.52, w: w-0.36, h: h-0.62, fontFace: font, fontSize: opts.bodySize || 9.2, color: opts.bodyColor || C.ink, breakLine: false, fit: 'shrink', valign: 'mid', margin: 0.02, paraSpaceAfterPt: 3, bullet: opts.bullet ? { type: 'ul' } : undefined });
}
function pill(slide, x, y, text, color=C.blue) {
  slide.addShape(pptx.ShapeType.roundRect, { x, y, w: 1.55, h: 0.32, rectRadius: 0.12, fill: { color }, line: { color } });
  slide.addText(text, { x: x+0.05, y: y+0.08, w: 1.45, h: 0.12, fontFace: font, fontSize: 7.8, bold: true, color: C.white, align: 'center', margin: 0 });
}
function sectionSlide(title, subtitle, quote) {
  const s = pptx.addSlide('MASTER');
  s.background = { color: C.navy };
  s.addShape(pptx.ShapeType.rect, { x: 0, y: 0, w: 13.333, h: 7.5, fill: { color: C.navy }, line: { color: C.navy } });
  s.addShape(pptx.ShapeType.arc, { x: 8.5, y: -1.2, w: 4.5, h: 4.5, line: { color: C.teal, transparency: 20, width: 4 }, adjustPoint: 0.2 });
  s.addText(title, { x: 0.78, y: 2.25, w: 9.8, h: 0.62, fontFace: font, fontSize: 31, bold: true, color: C.white, margin: 0 });
  s.addText(subtitle, { x: 0.82, y: 3.05, w: 9.8, h: 0.34, fontFace: font, fontSize: 13, color: C.mint, margin: 0 });
  s.addText(quote, { x: 0.82, y: 4.2, w: 8.8, h: 0.7, fontFace: font, fontSize: 12, italic: true, color: 'C9D6DF', margin: 0 });
  addFooter(s);
  return s;
}

// 1
let s = sectionSlide('jobmatching MVP 작업경과 공유', '단순 경과 보고가 아니라, 의사결정·교훈·재사용 가능한 원칙을 남기는 발표자료', '최종 MVP 완성 후 회고를 쉽게 하기 위해 지금부터 기록의 틀을 만든다.');
s.addText('2026.06 · 경기도 5070 일자리박람회 이력서 사전 접수 흐름', { x: 0.82, y: 5.25, w: 8.5, h: 0.25, fontFace: font, fontSize: 10.5, color: C.white, margin: 0 });

// 2
s = pptx.addSlide('MASTER'); addTitle(s, '이번 작업의 핵심 의미', '“자동 매칭 앱”에서 “구직자가 선택한 기업에 이력서를 정확히 전달하는 접수 흐름”으로 정리됨');
card(s, 0.72, 1.35, 3.75, 4.65, '문제 정의가 바뀜', '초기에는 업종 기반 자동 매칭에 가까웠지만, 실제 업무 흐름은 구직자가 공고를 보고 기업을 선택하는 구조였다.\n\n따라서 핵심은 추천 알고리즘보다 접수·동의·전달의 정확성이다.', { fill: 'EFF8FF', line: 'B6E0FE', bodySize: 10.2 });
card(s, 4.8, 1.35, 3.75, 4.65, '가벼운 연결 구조', '채용공고 전문은 jobmatching에 담지 않고, 원본 공고 링크로 연결한다.\n\n웹앱은 공고 요약·직무·지역·선택 상태만 관리한다.', { fill: 'F0FFF4', line: 'B7E4C7', bodySize: 10.2 });
card(s, 8.88, 1.35, 3.75, 4.65, '운영 관리 가능성', '관리자는 6개 탭 대시보드로 접수 현황, 기업별 현황, 이메일 로그, 원본 공고 연결 상태를 확인한다.\n\n운영 중 누락을 줄이는 구조다.', { fill: 'FFF8E6', line: 'F4B942', bodySize: 10.2 });
addFooter(s);

// 3
s = pptx.addSlide('MASTER'); addTitle(s, '현재까지 확정된 사용자 흐름', '외부 홈페이지와 jobmatching의 역할을 분리해 사용자의 행동 흐름을 단순화');
const steps = [
  ['외부 홈페이지', '기업 모집공고 검색·열람'],
  ['외부 홈페이지', '이력서 사전 접수 클릭'],
  ['jobmatching', '선택 기업 자동 체크'],
  ['jobmatching', '같은 직무 다른 공고 확인'],
  ['외부 원본 공고', '새 탭에서 전문 확인'],
  ['jobmatching', '추가 체크·이력서 업로드·동의'],
  ['이메일', '체크 기업 + 매칭 담당자에게 전달']
];
steps.forEach((st, i) => {
  const x = 0.62 + (i % 4) * 3.12;
  const y = i < 4 ? 1.35 : 4.08;
  s.addShape(pptx.ShapeType.roundRect, { x, y, w: 2.65, h: 1.35, rectRadius: 0.08, fill: { color: i < 2 ? 'E8F1FF' : i === 4 ? 'FFF2CC' : 'EAFBF8' }, line: { color: 'D0D8E0' } });
  s.addText(String(i+1), { x: x+0.12, y: y+0.12, w: 0.32, h: 0.28, fontFace: font, fontSize: 12, bold: true, color: C.blue, margin: 0 });
  s.addText(st[0], { x: x+0.52, y: y+0.16, w: 1.9, h: 0.2, fontFace: font, fontSize: 8.5, bold: true, color: C.gray, margin: 0 });
  s.addText(st[1], { x: x+0.2, y: y+0.55, w: 2.25, h: 0.48, fontFace: font, fontSize: 10.2, bold: true, color: C.navy, margin: 0, fit: 'shrink' });
  if (i < 6 && i !== 3) s.addShape(pptx.ShapeType.rightArrow, { x: x+2.7, y: y+0.54, w: 0.35, h: 0.22, fill: { color: C.teal }, line: { color: C.teal } });
});
addFooter(s);

// 4
s = pptx.addSlide('MASTER'); addTitle(s, '무엇을 만들었나: 현재 MVP 범위', '검증 가능한 기능은 만들고, 운영 버전에서 필요한 고도화는 의도적으로 남겨둠');
card(s, 0.62, 1.18, 3.0, 2.05, '데이터 확대', '구직자 50명\n고용기업 50개\n직무 8개·지역 분산', { fill: 'FFFFFF', titleColor: C.blue, bodySize: 11 });
card(s, 3.9, 1.18, 3.0, 2.05, '공고 선택 흐름', 'postingId/companyId 수신\n최초 기업 자동 체크\n해제 가능 안내', { fill: 'FFFFFF', titleColor: C.blue, bodySize: 11 });
card(s, 7.18, 1.18, 3.0, 2.05, '공고 연결', '요약 + 원본 링크\n새 탭으로 전문 확인\n웹앱 경량화', { fill: 'FFFFFF', titleColor: C.blue, bodySize: 11 });
card(s, 10.46, 1.18, 2.25, 2.05, '동의서', '제공 문구 반영\n필수 체크박스', { fill: 'FFFFFF', titleColor: C.blue, bodySize: 10.4 });
card(s, 0.62, 3.68, 5.75, 1.75, '이메일 발송 시뮬레이션', '구직자가 체크한 기업 담당자에게 각각 이력서 전달 로그 생성. 매칭 담당자에게도 신청 1건당 알림 로그 생성.', { fill: 'EAFBF8', bodySize: 10.5 });
card(s, 6.72, 3.68, 5.75, 1.75, '6개 탭 관리자 대시보드', '핵심현황 / 직무별 현황 / 기업별 현황 / 구직자별 상세 / 이메일 발송 로그 / 원본 공고 연결 관리', { fill: 'EFF8FF', bodySize: 10.5 });
addFooter(s);

// 5
s = pptx.addSlide('MASTER'); addTitle(s, '잘된 점', '요구사항을 바로 코드화하지 않고 업무 흐름을 재정의한 것이 가장 큰 성과');
card(s, 0.78, 1.2, 3.7, 4.7, '1. 역할 분리가 명확해짐', '외부 홈페이지는 공고 전문과 최초 유입을 담당하고, jobmatching은 선택·동의·이력서 전달을 담당한다.\n\n결과적으로 앱이 무거워지는 문제를 피했다.', { fill: 'EAFBF8', bodySize: 10.2 });
card(s, 4.82, 1.2, 3.7, 4.7, '2. 직무 기준으로 단순화', '업종이 아니라 직무 기준으로 공고를 묶었다.\n\n구직자 입장에서는 “내가 본 공고와 유사한 다른 기회”를 확인하는 방식이 더 자연스럽다.', { fill: 'EFF8FF', bodySize: 10.2 });
card(s, 8.86, 1.2, 3.7, 4.7, '3. 운영자의 확인 지점 확보', '이메일 로그, 기업별 접수 현황, 원본 공고 연결 관리 탭을 통해 운영 중 누락·오류를 발견할 수 있다.', { fill: 'FFF8E6', bodySize: 10.2 });
addFooter(s);

// 6
s = pptx.addSlide('MASTER'); addTitle(s, '아쉬운 점과 리스크', 'MVP 단계에서 아직 운영 안정성까지 완성된 것은 아님');
card(s, 0.78, 1.25, 3.75, 4.95, '데이터 연결 리스크', '외부 홈페이지의 공고 ID와 jobmatching 내부 데이터가 어긋나면 잘못된 기업이 자동 체크될 수 있다.\n\npostingId 기준 관리가 필요하다.', { fill: 'FFF0F0', line: 'F3B4B4', titleColor: C.red, bodySize: 10.2 });
card(s, 4.84, 1.25, 3.75, 4.95, '이메일은 아직 시뮬레이션', '현재는 실제 발송이 아니라 로그 생성이다.\n\n운영 버전에서는 첨부파일 보안, 발송 실패, 재시도, 수신 확인 정책이 필요하다.', { fill: 'FFF8E6', line: 'F4B942', titleColor: '8A5A00', bodySize: 10.2 });
card(s, 8.9, 1.25, 3.75, 4.95, '개인정보 처리 검토 필요', '동의 문안은 반영했지만 실제 운영 전에는 보관기간, 접근권한, 파기, 로그 관리, 첨부파일 저장 정책이 확정되어야 한다.', { fill: 'F5F7FA', line: 'CBD5E1', titleColor: C.navy, bodySize: 10.2 });
addFooter(s);

// 7
s = pptx.addSlide('MASTER'); addTitle(s, '다시 한다면 이렇게 시작하겠다', '기능 목록보다 “데이터 흐름과 책임 경계”를 먼저 확정하는 방식');
const redo = [
  ['1', '외부 홈페이지와 jobmatching의 책임 분리', '공고 원문, 유입 링크, 접수 처리, 이메일 전달의 담당 시스템을 먼저 나눈다.'],
  ['2', 'postingId를 핵심 키로 설계', '기업 ID보다 공고 ID를 우선한다. 같은 기업의 복수 공고를 구분하기 위해서다.'],
  ['3', '개인정보·이메일 정책 선확정', '동의 문안, 첨부파일 처리, 담당자 알림, 로그 보관 기준을 초기에 확정한다.'],
  ['4', '관리자 대시보드 요구를 먼저 정의', '운영자가 무엇을 확인해야 하는지 정하면 필요한 데이터 구조가 자연스럽게 나온다.']
];
redo.forEach((r, i) => {
  const y = 1.25 + i * 1.28;
  s.addShape(pptx.ShapeType.ellipse, { x: 0.8, y, w: 0.52, h: 0.52, fill: { color: C.blue }, line: { color: C.blue } });
  s.addText(r[0], { x: 0.95, y: y+0.14, w: 0.2, h: 0.18, fontFace: font, fontSize: 10, bold: true, color: C.white, margin: 0, align: 'center' });
  s.addText(r[1], { x: 1.55, y: y, w: 4.2, h: 0.28, fontFace: font, fontSize: 12.5, bold: true, color: C.navy, margin: 0 });
  s.addText(r[2], { x: 1.55, y: y+0.38, w: 10.3, h: 0.3, fontFace: font, fontSize: 9.7, color: C.gray, margin: 0 });
});
addFooter(s);

// 8
s = pptx.addSlide('MASTER'); addTitle(s, '결정 기록: 왜 “요약 + 원본 링크”인가', '웹앱을 가볍게 유지하면서도 구직자가 원문을 확인할 수 있는 절충안');
card(s, 0.75, 1.25, 3.65, 4.7, '웹앱에 공고 전문 저장', '장점: 한 화면에서 확인 가능\n단점: 데이터가 무거워지고 원본 수정 반영이 어려움\n\n판단: MVP에는 과함', { fill: 'FFF0F0', bodySize: 9.8, titleColor: C.red });
card(s, 4.85, 1.25, 3.65, 4.7, 'iframe으로 원본 표시', '장점: 이동 없이 확인 가능\n단점: 외부 사이트 보안 설정에 막힐 수 있고 모바일 UX가 불안정\n\n판단: 안정성 낮음', { fill: 'FFF8E6', bodySize: 9.8, titleColor: '8A5A00' });
card(s, 8.95, 1.25, 3.65, 4.7, '요약 + 원본 링크', '장점: 가볍고, 원본 정보 일원화 가능\n단점: 사용자가 새 탭에서 돌아와야 함\n\n판단: 현재 단계 최적안', { fill: 'EAFBF8', bodySize: 9.8, titleColor: C.green });
addFooter(s);

// 9
s = pptx.addSlide('MASTER'); addTitle(s, '최종 MVP 완성 전 남은 과제', '지금은 “내부 확인용 MVP”, 운영 버전으로 가려면 아래 의사결정이 필요');
card(s, 0.7, 1.18, 2.9, 2.1, '실제 이메일 발송', 'SMTP/API 선택\n첨부파일 용량 제한\n실패 재시도 정책', { fill: 'FFFFFF', bodySize: 10 });
card(s, 3.85, 1.18, 2.9, 2.1, '공고 데이터 관리', 'postingId 체계\nCSV 업로드\n마감/비공개 상태', { fill: 'FFFFFF', bodySize: 10 });
card(s, 7.0, 1.18, 2.9, 2.1, '보안·개인정보', '접근권한\n파일 저장/파기\n동의 이력 보관', { fill: 'FFFFFF', bodySize: 10 });
card(s, 10.15, 1.18, 2.45, 2.1, '배포', '공유 가능한 주소\n관리자 인증\n백엔드 DB', { fill: 'FFFFFF', bodySize: 10 });
card(s, 0.7, 3.85, 5.75, 1.75, '테스트 관점', '구직자 1명이 여러 기업을 선택하는 흐름, 자동 선택 기업 해제, 원본 공고 새 탭 이동, 이메일 로그 생성까지 end-to-end 확인 필요', { fill: 'EFF8FF', bodySize: 10.5 });
card(s, 6.85, 3.85, 5.75, 1.75, '운영 관점', '관리자가 기업별 접수 현황과 이메일 발송 로그를 보고 “누락 없이 접수되었는지” 판단할 수 있어야 함', { fill: 'EAFBF8', bodySize: 10.5 });
addFooter(s);

// 10
s = sectionSlide('공유할 핵심 메시지', '이번 MVP의 가치는 화면보다 “업무 흐름을 정확히 재정의한 것”에 있다', '다음 단계는 실제 운영 조건을 반영해 이메일·공고 데이터·개인정보 처리를 안전하게 연결하는 것이다.');
card(s, 0.85, 5.25, 3.55, 1.0, '한 줄 요약', '구직자가 선택한 기업에 이력서를 정확히 전달하는 경량 접수 시스템', { fill: 'FFFFFF', bodySize: 9.8, shadow: false });
card(s, 4.85, 5.25, 3.55, 1.0, '가장 큰 교훈', '자동화보다 먼저 실제 사용자 행동과 운영 책임을 정리해야 한다', { fill: 'FFFFFF', bodySize: 9.8, shadow: false });
card(s, 8.85, 5.25, 3.55, 1.0, '다음 의사결정', '실제 이메일 발송, postingId 관리, 개인정보 처리 정책 확정', { fill: 'FFFFFF', bodySize: 9.8, shadow: false });

pptx.writeFile({ fileName: '/mnt/c/Users/hb/Documents/HermesWork/jobmatching-mvp/jobmatching_작업경과_공유자료.pptx' });
