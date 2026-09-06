// 전역 상태 변수
let currentPage = 1;
const rowsPerPage = 20;
let selectedGroup = '전체';
let sortColumn = null;
let sortAscending = true;

// 성적 데이터 가져오기
function getScores() {
    return {
        kor: parseFloat(document.getElementById('kor').value) || 0,
        mat: parseFloat(document.getElementById('mat').value) || 0,
        tam1: parseFloat(document.getElementById('tam1').value) || 0,
        tam1_type: document.getElementById('tam1_type').value,
        tam2: parseFloat(document.getElementById('tam2').value) || 0,
        tam2_type: document.getElementById('tam2_type').value,
        eng: parseInt(document.getElementById('eng').value) || 1,
        his: parseInt(document.getElementById('his').value) || 1,
    };
}

// 군 필터 설정
function filterGroup(group) {
    selectedGroup = group;
    resetPageAndRender();
}

// 정렬 설정
function sortData(col) {
    if (sortColumn === col) {
        sortAscending = !sortAscending;
    } else {
        sortColumn = col;
        sortAscending = true;
    }
    renderTable();
}

// 페이지 리셋 후 다시 그리기
function resetPageAndRender() {
    currentPage = 1;
    renderTable();
}

// 모달 열기
function openModal(univ, dept) {
    const item = rawData.find(d => d.univ === univ && d.dept === dept);
    if (!item) return;

    document.getElementById('m-univ').textContent = item.univ;
    document.getElementById('m-dept').textContent = item.dept;

    // 2026
    document.getElementById('m-cr26').textContent = item.cr26 || '-';
    document.getElementById('m-cut26').textContent = item.cut26 || '-';
    document.getElementById('m-comp26').textContent = item.comp26 || '-';

    // 2025
    document.getElementById('m-cr25').textContent = item.cr25 || '-';
    document.getElementById('m-cut25').textContent = item.cut25 || '-';
    document.getElementById('m-comp25').textContent = item.comp25 || '-';

    // 2024
    document.getElementById('m-cr24').textContent = item.cr24 || '-';
    document.getElementById('m-cut24').textContent = item.cut24 || '-';
    document.getElementById('m-comp24').textContent = item.comp24 || '-';

    // cut-label 설정
    const config = univConfigs[item.univ];
    const labelText = config ? `입결(${config.cutType})` : '입결';
    document.querySelectorAll('.cut-label').forEach(el => el.textContent = labelText);

    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modal').classList.add('flex');
}

// 모달 닫기
function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal').classList.remove('flex');
}

// 테이블 메인 렌더링
function renderTable() {
    const scores = getScores();
    const searchUniv = document.getElementById('searchUniv').value.trim().toLowerCase();
    const searchDept = document.getElementById('searchDept').value.trim().toLowerCase();

    // 1. 계산 및 필터링
    let processed = rawData.map(item => {
        const config = univConfigs[item.univ];
        let myScore = null;
        let diff = null;
        let statusText = '자료없음';
        let statusClass = 'status-normal';

        if (config && config.calculator) {
            myScore = config.calculator(scores, item.type);
            const targetCut = parseFloat(item.adjCut || item.cut25);

            if (!isNaN(targetCut)) {
                diff = parseFloat((myScore - targetCut).toFixed(2));
                if (diff >= 7) { statusText = '매우안정'; statusClass = 'status-v-safe'; }
                else if (diff >= 3) { statusText = '안정'; statusClass = 'status-safe'; }
                else if (diff >= -1) { statusText = '적정'; statusClass = 'status-normal'; }
                else if (diff >= -4) { statusText = '소신'; statusClass = 'status-caution'; }
                else { statusText = '위험'; statusClass = 'status-danger'; }
            }
        }

        return { ...item, myScore, diff, statusText, statusClass };
    }).filter(item => {
        if (selectedGroup !== '전체' && item.group !== selectedGroup) return false;
        if (searchUniv && !item.univ.toLowerCase().includes(searchUniv)) return false;
        if (searchDept && !item.dept.toLowerCase().includes(searchDept)) return false;
        return true;
    });

    // 2. 정렬
    if (sortColumn === 'cap') {
        processed.sort((a, b) => {
            const capA = parseInt(a.cap) || 0;
            const capB = parseInt(b.cap) || 0;
            return sortAscending ? capA - capB : capB - capA;
        });
    } else if (sortColumn === 'diff') {
        processed.sort((a, b) => {
            const diffA = a.diff !== null ? a.diff : -999;
            const diffB = b.diff !== null ? b.diff : -999;
            return sortAscending ? diffA - diffB : diffB - diffA;
        });
    }

    // 3. 페이지네이션
    const totalRows = processed.length;
    const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;
    if (currentPage > totalPages) currentPage = totalPages;

    const startIdx = (currentPage - 1) * rowsPerPage;
    const pageData = processed.slice(startIdx, startIdx + rowsPerPage);

    // 4. 테이블 작성
    const tbody = document.getElementById('dataTable');
    tbody.innerHTML = pageData.map(item => {
        const targetCutStr = item.adjCut ? `${item.adjCut}*` : (item.cut25 || '자료없음');
        return `
            <tr class="border-b hover:bg-slate-50 transition cursor-pointer" onclick="openModal('${item.univ}', '${item.dept}')">
                <td class="p-4 text-xs font-bold text-slate-500">${item.group}</td>
                <td class="p-4 text-sm font-extrabold text-slate-800">${item.univ}</td>
                <td class="p-4 text-sm font-medium text-slate-700">${item.dept}</td>
                <td class="p-4 text-xs font-bold text-slate-500">${item.cap}</td>
                <td class="p-4 text-xs ${item.statusClass}">${item.statusText} ${item.diff !== null ? `(${item.diff > 0 ? '+' : ''}${item.diff})` : ''}</td>
                <td class="p-4 text-sm font-black text-right text-slate-800">${item.myScore !== null ? item.myScore : '-'}</td>
                <td class="p-4 text-xs text-right text-slate-500">${targetCutStr}</td>
            </tr>
        `;
    }).join('');

    // 5. 페이지네이션 버튼 그리기
    renderPagination(totalPages);
}

// 페이지네이션 HTML 생성
function renderPagination(totalPages) {
    const container = document.getElementById('pagination');
    let html = `
        <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} class="page-btn">이전</button>
    `;

    for (let i = 1; i <= totalPages; i++) {
        html += `
            <button onclick="changePage(${i})" class="page-btn ${i === currentPage ? 'active' : ''}">${i}</button>
        `;
    }

    html += `
        <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} class="page-btn">다음</button>
    `;
    container.innerHTML = html;
}

function changePage(page) {
    currentPage = page;
    renderTable();
}

// 초기 실행
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
});

