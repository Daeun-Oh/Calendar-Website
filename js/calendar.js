// 전역 변수: 현재 선택된 날짜
let selectedDate = null;

const sche = {
    items: [], // 전체 스케줄 항목들
    tpl: null, // HTML 템플릿 참조용

    // 초기화 함수
    init() {
        this.tpl = document.getElementById("tpl").innerHTML;

        // localStorage에서 sches-로 시작하는 모든 일정 불러오기
        this.items = [];
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith("sches-")) {
                const data = JSON.parse(localStorage.getItem(key));
                if (Array.isArray(data)) {
                    this.items.push(...data);
                }
            }
        });

        this.render(); // 초기 렌더링 실행
    },

    // 일정 추가 함수
    add(item) {
        const key = `sches-${item.date}`;
        const existing = JSON.parse(localStorage.getItem(key)) || [];
        existing.push(item);
        localStorage.setItem(key, JSON.stringify(existing));
        this.init(); // 다시 목록 불러오기

        location.reload();
    },

    // 일정 삭제 함수
    remove(seq) {
        const index = this.items.findIndex(item => item.seq === seq);
        if (index === -1) return;

        const item = this.items[index];
        const key = `sches-${item.date}`;
        const data = JSON.parse(localStorage.getItem(key)) || [];

        const updated = data.filter(d => d.seq !== seq);

        if (updated.length > 0) {
            localStorage.setItem(key, JSON.stringify(updated));
        } else {
            localStorage.removeItem(key);
        }

        this.init(); // 다시 렌더링
    },

    // 스케줄 목록 렌더링 함수
    render() {
        const targetEl = document.getElementById("schedule-items");
        const domParser = new DOMParser();

        // 로딩 메시지 출력
        targetEl.innerHTML = `<div class="d-flex justify-content-center mt-5 mb-10">
                                <div class="spinner-grow text-info" role="status">
                                    <span class="visually-hidden">등록된 스케줄을 조회하고있습니다.</span>
                                </div>
                              </div>`;

        setTimeout(() => {
            // 선택된 날짜의 항목만 보여주기
            const filteredItems = selectedDate
                ? this.items.filter(item => item.date === selectedDate)
                : this.items;

            // 없으면 안내 메시지
            if (filteredItems.length === 0) {
                targetEl.innerHTML = `<div class="alert alert-warning" role="alert">
                                        등록된 스케줄이 없습니다
                                     </div>`;
                return;
            }

            // 스케줄 항목 렌더링
            targetEl.innerHTML = "";
            filteredItems.forEach(({ seq, date, title, content }) => {
                let html = this.tpl;
                html = html.replace(/#{seq}/g, seq)
                           .replace(/#{date}/g, date)
                           .replace(/#{title}/g, title)
                           .replace(/#{content}/g, content || '<span class="text-muted">내용이 없습니다</span>');

                const dom = domParser.parseFromString(html, "text/html");
                const el = dom.querySelector(".accordion-item");

                targetEl.append(el);

                // 삭제 버튼 클릭 시 처리
                const removeEl = el.querySelector(".remove");
                removeEl.addEventListener("click", () => {
                    if (confirm("정말 삭제하시겠습니까?")) {
                        this.remove(seq);
                    }
                });
            });
        }, 300);
    },
};

const calendar = {
    tpl: null, // 달력 HTML 템플릿
    year: null,
    month: null,

    // 달력 초기화 함수
    init() {
        const date = new Date();
        this.tpl = document.getElementById("tpl-calendar").innerHTML;
        this.year = date.getFullYear();
        this.month = date.getMonth() + 1;

        const month = String(this.month).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");

        document.getElementById("today-date").textContent = `오늘 날짜: ${this.year}-${month}-${day}`;
        this.render();
    },

    // 해당 연도, 월의 날짜 배열 생성
    getRange(year, month) {
        const startDate = new Date(year, month - 1, 1);
        const startYoil = startDate.getDay();

        const data = [];
        for (let i = -startYoil; i < 42 - startYoil; i++) {
            const date = new Date(year, month - 1, 1);
            date.setDate(date.getDate() + i);

            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, "0");
            const d = String(date.getDate()).padStart(2, "0");
            data.push({ str: `${y}-${m}-${d}`, day: d });
        }
        return data;
    },

    // 달력 출력 함수
    render() {
        const items = this.getRange(this.year, this.month);
        const targetEls = document.getElementById("calendar-dates");
        const domParser = new DOMParser();

        // 헤더 연도, 월 표시
        document.querySelector(".calendar-nav .year").textContent = this.year;
        document.querySelector(".calendar-nav .month").textContent = String(this.month).padStart(2, "0");

        targetEls.innerHTML = "";

        // 각 날짜 셀 렌더링
        items.forEach(({ str, day }) => {
            let html = this.tpl;
            html = html.replace(/#{value}/g, str).replace(/#{date}/g, day);

            const dom = domParser.parseFromString(html, "text/html");
            const li = dom.querySelector("li");

            // 스케줄 개수 S //

            // 스케줄 개수 계산
            const storageKey = `sches-${str}`;
            const data = JSON.parse(localStorage.getItem(storageKey)) || [];
            const count = data.length;

            // 개수 표시 엘리먼트 추가
            if (count > 0) {
                const badge = document.createElement("span");
                badge.className = "badge bg-info text-white ms-1";
                badge.textContent = `${count}개`;
                li.querySelector(".date").after(badge); // .date 다음에 뱃지를 붙임
            }

            // 스케줄 개수 E //
            

            //let selectedDate = null; // 클릭한 날짜 저장용
          
            // 날짜 클릭 이벤트
            li.addEventListener("click", () => {
                selectedDate = str; // 선택한 날짜 저장

                const formWrapper = document.getElementById("form-wrapper");
                //formWrapper.style.display = "block"; // 폼 보이기
                formWrapper.style.display = (formWrapper.style.display === "block") ? "none" : "block";
                document.getElementById("sche-title").focus();

                const quillContainer = document.querySelector('#sche-content .ql-editor');
                if (!quillContainer) {
                    new Quill('#sche-content', { theme: 'bubble' });
                }

                sche.render(); // 스케줄 목록 다시 출력
                document.getElementById("schedule-items").scrollIntoView({ behavior: "smooth" });
            });

            targetEls.append(li);
        });
    },
};

window.addEventListener("DOMContentLoaded", function () {
    sche.init();
    calendar.init();

    const quill = new Quill('#sche-content', { theme: 'bubble' });
    const frmRegist = document.getElementById("schedule-regist");

    frmRegist.addEventListener("submit", function (e) {
        e.preventDefault();

        const errorEls = frmRegist.querySelectorAll(".alert");
        errorEls.forEach(el => el.remove());

        const errors = [], item = { seq: Date.now() };

        for (const [field, message] of Object.entries(requiredFields)) {
            const value = typeof frmRegist[field]?.value === 'string' ? frmRegist[field].value.trim() : '';
            if (!value) {
                errors.push(message);
            } else {
                item[field] = value;
            }
        }

        const contentText = quill.getText().trim();
        const contentHTML = quill.root.innerHTML.trim();

        if (selectedDate) {
            item.date = selectedDate;
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            item.date = `${year}-${month}-${day}`;
        }

        if (errors.length > 0) {
            errors.reverse().forEach(m => {
                const errorEl = document.createElement("div");
                errorEl.className = 'alert alert-danger';
                errorEl.setAttribute("role", "alert");
                errorEl.textContent = m;
                frmRegist.prepend(errorEl);
            });
            return;
        }

        sche.add(item);
        frmRegist.title.value = '';
        quill.root.innerHTML = '';
        selectedDate = null;
    });

    const navBtns = document.getElementsByClassName("nav-btn");
    for (const el of navBtns) {
        el.addEventListener("click", function () {
            const date = new Date(calendar.year, calendar.month - 1, 1);
            if (this.classList.contains("next")) {
                date.setMonth(date.getMonth() + 1);
            } else {
                date.setMonth(date.getMonth() - 1);
            }
            calendar.year = date.getFullYear();
            calendar.month = date.getMonth() + 1;
            calendar.render();
        });
    }
});

window.addEventListener('DOMContentLoaded', () => {
    let selectedDate = null;
    const form = document.getElementById('schedule-regist');
    const quill = new Quill('#sche-content', { theme: 'bubble' });
  
    // 날짜 클릭 시 선택한 날짜 저장
    document.querySelectorAll('#calendar-dates li').forEach(li => {
        li.addEventListener('click', () => {
            if (li.classList.contains('selected')) {
                li.classList.remove('selected');
            } else {
                document.querySelectorAll('#calendar-dates li.selected').forEach(el => {
                    el.classList.remove('selected');
                });
                li.classList.add('selected'); // 현재 클릭한 날짜에 클래스 추가
            }
            const day = li.querySelector('.date').textContent.padStart(2, '0');
            const year = document.querySelector('.calendar-nav .year').textContent;
            const month = document.querySelector('.calendar-nav .month').textContent.padStart(2, '0');
         
            // 같은 날짜를 연속 2번 누르면 selectedDate가 null이 되게 (+ 스케줄 작성 영역이 사라지게)
            selectedDate = selectedDate === `${year}-${month}-${day}` ? null : `${year}-${month}-${day}`;
            //console.log(selectedDate);
        });
    });
  
    // 폼 제출 시 localStorage 저장
    form.addEventListener('submit', (e) => {
        e.preventDefault();
  
        const title = form.title.value.trim();
         const content = quill.root.innerHTML.trim();
  
        if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
        }
  
        const item = {
            seq: Date.now(),
            date: selectedDate,
            title,
            content
        };
  
        // 날짜별 key로 localStorage에 저장
        const storageKey = `sches-${selectedDate}`;
        const existing = JSON.parse(localStorage.getItem(storageKey)) || [];
        existing.push(item);
        localStorage.setItem(storageKey, JSON.stringify(existing));
  
        const formA = document.getElementById("above-form-inner");
        
        formA.innerHTML = `
         <svg xmlns="http://www.w3.org/2000/svg" class="d-none">
             <symbol id="check-circle-fill" viewBox="0 0 16 16">
                 <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
             </symbol>
         </svg>
         <div class="alert alert-success d-flex align-items-center alert-dismissible fade show" role="alert">
             <svg class="bi flex-shrink-0 me-2" role="img" aria-label="Success:" width="20" height="20"><use xlink:href="#check-circle-fill"/></svg>
             <div>
                 An example success alert with an icon
             </div>
             <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
         </div>`;//alert(`${selectedDate} 스케줄이 저장되었습니다.`);
  
        // 초기화
        form.title.value = "";
        quill.setText("");
        quill.root.innerHTML = "";
        selectedDate = null;
        document.getElementById("form-wrapper").style.display = "none";

        // 스케줄 목록 
        sche.init();
        // 캘린더 새로고침
        calendar.render();

    });
  });
  