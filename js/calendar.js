let selectedDate = null;

const todo = {
    items: [],
    tpl: null,

    init() {
        this.tpl = document.getElementById("tpl").innerHTML;
        const data = localStorage.getItem("todos");
        this.items = data ? JSON.parse(data) : [];
        this.render();
    },

    add(item) {
        this.items.push(item);
        this.items.sort((i1, i2) => new Date(i2.date) - new Date(i1.date));
        this.save();
        this.render();
    },

    remove(seq) {
        const index = this.items.findIndex(item => item.seq === seq);
        if (index === -1) return;
        this.items.splice(index, 1);
        this.save();
        this.render();
    },

    render() {
        const targetEl = document.getElementById("schedule-items");
        const domParser = new DOMParser();

        targetEl.innerHTML = `<div class="d-flex justify-content-center mt-5 mb-10">
                                <div class="spinner-grow text-info" role="status">
                                    <span class="visually-hidden">등록된 스케줄을 조회하고있습니다.</span>
                                </div>
                              </div>`;

        setTimeout(() => {
            if (this.items.length === 0) {
                targetEl.innerHTML = `<div class="alert alert-warning" role="alert">
                                        등록된 스케줄이 없습니다
                                     </div>`;
                return;
            }

            targetEl.innerHTML = "";
            this.items.forEach(({ seq, date, title, content }) => {
                let html = this.tpl;
                html = html.replace(/#{seq}/g, seq)
                           .replace(/#{date}/g, date)
                           .replace(/#{title}/g, title)
                           .replace(/#{content}/g, content || '<span class="text-muted">내용이 없습니다</span>');

                const dom = domParser.parseFromString(html, "text/html");
                const el = dom.querySelector(".accordion-item");
                targetEl.append(el);

                const removeEl = el.querySelector(".remove");
                removeEl.addEventListener("click", () => {
                    if (confirm('정말 삭제하시겠습니까?')) {
                        this.remove(seq);
                    }
                });
            });
        }, 1500);
    },

    save() {
        const data = JSON.stringify(this.items);
        localStorage.setItem("todos", data);
    }
};

const calendar = {
    tpl: null,
    year: null,
    month: null,

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

    getRange(year, month) {
        const today = new Date();
        year = year ?? today.getFullYear();
        month = month ?? today.getMonth() + 1;

        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        const startYoil = startDate.getDay();

        const data = [];
        for (let i = -startYoil; i < 42 - startYoil; i++) {
            const date = new Date(year, month - 1, 1);
            date.setDate(date.getDate() + i);

            const _year = date.getFullYear();
            const _month = date.getMonth() + 1;
            const _date = date.getDate();
            const str = `${_year}-${String(_month).padStart(2, '0')}-${String(_date).padStart(2, '0')}`;

            data.push({ date, day: _date, str });
        }

        return data;
    },

    render() {
        const items = this.getRange(this.year, this.month);
        const targetEls = document.getElementById("calendar-dates");
        const domParsers = new DOMParser();

        document.querySelector(".calendar-nav .year").textContent = this.year;
        document.querySelector(".calendar-nav .month").textContent = String(this.month).padStart(2, '0');

        targetEls.innerHTML = "";
        items.forEach(({ day, str }) => {
            let html = this.tpl;
            html = html.replace(/#{value}/g, str).replace(/#{date}/g, String(day).padStart(2, '0'));

            const dom = domParsers.parseFromString(html, "text/html");
            const li = dom.querySelector("li");

            li.addEventListener("click", () => {
                selectedDate = str;
                const formWrapper = document.getElementById("form-wrapper");
                formWrapper.style.display = "block";
                document.getElementById("todo-title").focus();

                const quillContainer = document.querySelector('#todo-content .ql-editor');
                if (!quillContainer) {
                    new Quill('#todo-content', { theme: 'bubble' });
                }

                const scheduleEl = document.getElementById("schedule-items");
                scheduleEl.scrollIntoView({ behavior: 'smooth' });
            });

            targetEls.append(li);
        });
    }
};

window.addEventListener("DOMContentLoaded", function () {
    todo.init();
    calendar.init();

    const quill = new Quill('#todo-content', { theme: 'bubble' });
    const frmRegist = document.getElementById("schedule-regist");

    frmRegist.addEventListener("submit", function (e) {
        e.preventDefault();

        const errorEls = frmRegist.querySelectorAll(".alert");
        errorEls.forEach(el => el.remove());

        const requiredFields = {
            title: '제목을 입력하세요.',
        };

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

        if (!contentText) {
            errors.push('내용을 입력하세요.');
        } else {
            item.content = contentHTML;
        }

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

        todo.add(item);
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
