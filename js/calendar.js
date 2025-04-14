const calendar = {
    tpl: null,
    year: null,
    month: null,
    /**
     * 초기에 처리할 부분 
     * 
     */
    init() {
        const date = new Date();
        this.tpl = document.getElementById("tpl-calendar").innerHTML;
        this.year = date.getFullYear();
        this.month = date.getMonth() + 1;
        

        const month = ("" + this.month).padStart(2, '0');
        const day = ('' + date.getDate()).padStart(2, '0');
        document.getElementById('today-date').textContent = `오늘 날짜: ${this.year}-${month}-${day}`;
          

        this.render();
    },
    // 달력 일자
    getRange(year, month) {
        if (!year || !month) {
            const today = new Date();
            year = year ?? today.getFullYear();
            month = month ?? today.getMonth() + 1;
        }
        
        /** 
        * 1) 매1일의 요일
        * 2) 마지막 일 
        */

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month - 1, 1);
        endDate.setMonth(endDate.getMonth() + 1)
        endDate.setDate(endDate.getDate() - 1);

        const startYoil = startDate.getDay(); // 요일 

        const data = []; // 달력 정보
        let count = 0; //  이번달까지의 일자
        for (let i = -startYoil; i < 42 - startYoil; i++) {
            const date = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
            date.setDate(date.getDate() + i);

            const _year = date.getFullYear(), _month = date.getMonth() + 1, _date = date.getDate();

            const __month = ("" + _month).padStart(2, '0');
            const __date = ("" + _date).padStart(2, '0');
            
            data.push({
                date,
                day: date.getDate(),
                str: _year + "-" + __month + "-" + __date,
            });

            if (_month <= month) {
                count++;
            }
        }

        if (count < 35) {
            data.length = 35;
        }

        return data;
    },
    /**
     * 달력 출력 
     * 
     */
    render() {
        const items = this.getRange(this.year, this.month);
        const targetEl = document.getElementById("calendar-dates");
        
        const domParser = new DOMParser();

        // 달력 nav 출력 
        document.querySelector(".calendar-nav .year").innerHTML = this.year;
        document.querySelector(".calendar-nav .month").innerHTML = ("" + this.month).padStart(2, '0');

        // 달력 일자 출력 S 
        targetEl.innerHTML = "";
        items.forEach(({day, str }) => {
            let html = this.tpl;
            html = html.replace(/#{value}/g, str)
                        .replace(/#{date}/g, ("" + day).padStart(2, '0'));
                      
            const dom = domParser.parseFromString(html, "text/html");
            const li = dom.querySelector("li");

            let selectedDate = null; // 클릭한 날짜 저장용

            li.addEventListener("click", function () {
                //selectedDate = str; // 예: "2025-04-14" 형식

                const viewEl = document.getElementById("form-wrapper");
                viewEl.style.display = (viewEl.style.display === "block") ? "none" : "block";
            });

            targetEl.append(li);
           
            
        });
        
                
    }
}
        
        // 달력 일자 출력 E

window.addEventListener("DOMContentLoaded", function() {
    calendar.init();
    const quill = new Quill('#sche-content', { //quill 내용
        theme: 'bubble',
      })

    const navBtns = document.getElementsByClassName("nav-btn");
    for (const el of navBtns) {
        el.addEventListener("click", function() {
            const date = new Date(calendar.year, calendar.month - 1, 1);
           if (this.classList.contains("next")) { // 다음달 
            date.setMonth(date.getMonth() + 1);
           } else { // 이전달
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
        const day = li.querySelector('.date').textContent.padStart(2, '0');
        const year = document.querySelector('.calendar-nav .year').textContent;
        const month = document.querySelector('.calendar-nav .month').textContent.padStart(2, '0');
        selectedDate = `${year}-${month}-${day}`;
      });
    });
  
    // 폼 제출 시 localStorage 저장
    form.addEventListener('submit', (e) => {
      e.preventDefault();
  
      if (!selectedDate) {
        alert('날짜를 먼저 선택하세요.');
        return;
      }
  
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
      const storageKey = `todos-${selectedDate}`;
      const existing = JSON.parse(localStorage.getItem(storageKey)) || [];
      existing.push(item);
      localStorage.setItem(storageKey, JSON.stringify(existing));
  
      alert(`${selectedDate} 스케줄이 저장되었습니다.`);
  
      // 초기화
      form.title.value = '';
      quill.root.innerHTML = '';
      selectedDate = null;
    });
  });
  