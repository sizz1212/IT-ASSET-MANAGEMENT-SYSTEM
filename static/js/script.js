/* =========================================================================
   ASSET OS — MAIN CONTENT BEHAVIOR
   ========================================================================= */
document.addEventListener('DOMContentLoaded', () => {

  /* ---------------- Ripple effect on buttons ---------------- */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function(e){
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      const size = Math.max(rect.width, rect.height);
      ripple.className = 'ripple';
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    });
  });

  /* ---------------- Animated counters ---------------- */
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const el = entry.target;
      if(el.dataset.counted) return;
      el.dataset.counted = '1';
      const target = +el.dataset.target;
      const duration = 900;
      const start = performance.now();
      function step(now){
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.floor(eased * target).toLocaleString();
        if(p < 1) requestAnimationFrame(step); else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(step);
    });
  }, {threshold:.4});
  document.querySelectorAll('.count').forEach(el => counterObserver.observe(el));

  /* ---------------- Progress bars ---------------- */
  const progressObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(!entry.isIntersecting) return;
      const bar = entry.target;
      bar.style.width = bar.dataset.value + '%';
      progressObserver.unobserve(bar);
    });
  }, {threshold:.4});
  document.querySelectorAll('.progress-bar').forEach(el => progressObserver.observe(el));

  /* ---------------- Generic dropdown wiring ---------------- */
  function closeAllDropdowns(except){
    document.querySelectorAll('.dropdown-panel.show').forEach(p => { if(p !== except) p.classList.remove('show'); });
    document.querySelectorAll('.dropdown-trigger.open').forEach(t => { if(t.nextElementSibling !== except) t.classList.remove('open'); });
  }
  document.querySelectorAll('[data-dropdown]').forEach(wrap => {
    const trigger = wrap.querySelector('.dropdown-trigger');
    const panel = wrap.querySelector('.dropdown-panel');
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.contains('show');
      closeAllDropdowns(isOpen ? null : panel);
      panel.classList.toggle('show', !isOpen);
      trigger.classList.toggle('open', !isOpen);
    });
    panel?.querySelectorAll('.dropdown-option').forEach(opt => {
      opt.addEventListener('click', () => {
        panel.querySelectorAll('.dropdown-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
        const label = wrap.querySelector('.dropdown-label');
        if(label) label.textContent = opt.dataset.label || opt.textContent.trim();
        panel.classList.remove('show');
        trigger.classList.remove('open');
      });
    });
  });

  /* ---------------- Date picker ---------------- */
  const dpWrap = document.getElementById('datePicker');
  if(dpWrap){
    const trigger = dpWrap.querySelector('.dropdown-trigger');
    const panel = dpWrap.querySelector('.datepicker-panel');
    const grid = document.getElementById('dpGrid');
    const monthLabel = document.getElementById('dpMonthLabel');
    let viewDate = new Date();
    let selected = null;

    function renderCalendar(){
      const year = viewDate.getFullYear();
      const month = viewDate.getMonth();
      monthLabel.textContent = viewDate.toLocaleString('default', {month:'long', year:'numeric'});
      const firstDay = new Date(year, month, 1).getDay();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const daysInPrevMonth = new Date(year, month, 0).getDate();
      let html = ['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => `<div class="dp-dow">${d}</div>`).join('');
      const today = new Date();
      for(let i = firstDay - 1; i >= 0; i--){
        html += `<div class="dp-cell muted">${daysInPrevMonth - i}</div>`;
      }
      for(let d = 1; d <= daysInMonth; d++){
        const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
        const isSelected = selected && d === selected.getDate() && month === selected.getMonth() && year === selected.getFullYear();
        html += `<div class="dp-cell ${isToday ? 'today' : ''} ${isSelected ? 'selected' : ''}" data-day="${d}">${d}</div>`;
      }
      grid.innerHTML = html;
      grid.querySelectorAll('.dp-cell[data-day]').forEach(cell => {
        cell.addEventListener('click', () => {
          selected = new Date(year, month, +cell.dataset.day);
          trigger.querySelector('.dropdown-label').textContent = selected.toLocaleDateString('default',{month:'short',day:'numeric',year:'numeric'});
          renderCalendar();
          panel.classList.remove('show');
        });
      });
    }
    document.getElementById('dpPrev')?.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() - 1); renderCalendar(); });
    document.getElementById('dpNext')?.addEventListener('click', () => { viewDate.setMonth(viewDate.getMonth() + 1); renderCalendar(); });
    trigger?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = panel.classList.contains('show');
      closeAllDropdowns();
      panel.classList.toggle('show', !isOpen);
    });
    renderCalendar();
  }

  document.addEventListener('click', () => closeAllDropdowns());

  /* ---------------- Modal ---------------- */
  window.openModal = function(id){
    document.getElementById(id)?.classList.add('show');
  };
  window.closeModal = function(id){
    document.getElementById(id)?.classList.remove('show');
  };
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => { if(e.target === overlay) overlay.classList.remove('show'); });
  });

  /* ---------------- Toasts ---------------- */
  const toastStack = document.getElementById('toastStack');
  const toastConfig = {
    success:{icon:'fa-check', title:'Success'},
    warning:{icon:'fa-triangle-exclamation', title:'Heads up'},
    danger:{icon:'fa-circle-xmark', title:'Error'},
    info:{icon:'fa-circle-info', title:'Notice'}
  };
  window.showToast = function(type, title, message){
    if(!toastStack) return;
    const cfg = toastConfig[type] || toastConfig.info;
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
      <span class="toast-icon"><i class="fa-solid ${cfg.icon}"></i></span>
      <div class="toast-text"><strong>${title || cfg.title}</strong><span>${message || ''}</span></div>
      <i class="fa-solid fa-xmark toast-close"></i>`;
    toastStack.appendChild(el);
    requestAnimationFrame(() => el.classList.add('show'));
    const remove = () => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); };
    el.querySelector('.toast-close').addEventListener('click', remove);
    setTimeout(remove, 4200);
  };

  document.querySelectorAll('[data-action="add-asset"]').forEach(b => b.addEventListener('click', () => showToast('success','Asset registered','Dell Latitude 5440 added to inventory.')));
  document.querySelectorAll('[data-action="assign-asset"]').forEach(b => b.addEventListener('click', () => showToast('info','Assignment started','Choose an employee to continue.')));
  document.querySelectorAll('[data-action="generate-report"]').forEach(b => b.addEventListener('click', () => showToast('info','Generating report','Your report will be ready in a moment.')));
  document.querySelectorAll('[data-action="export-data"]').forEach(b => b.addEventListener('click', () => showToast('success','Export complete','assets_export.csv downloaded.')));

  /* ---------------- Chart loading overlays ---------------- */
  document.querySelectorAll('.chart-loading').forEach(overlay => {
    setTimeout(() => overlay.classList.add('hide'), 550);
  });

  /* ---------------- Data table: search, filter, sort, paginate ---------------- */
  const ASSETS = [
    {id:'AST-1042', name:'MacBook Pro 16"', category:'Laptops', owner:'Sarah Chen', status:'Active', value:2899, date:'2025-03-14'},
    {id:'AST-1043', name:'Dell Latitude 5440', category:'Laptops', owner:'James Ortiz', status:'Active', value:1299, date:'2025-01-22'},
    {id:'AST-1044', name:'Dell Monitor U2723', category:'Monitors', owner:'Unassigned', status:'Available', value:429, date:'2025-06-02'},
    {id:'AST-1045', name:'ThinkPad X1 Carbon', category:'Laptops', owner:'Priya Nair', status:'Maintenance', value:1599, date:'2024-11-08'},
    {id:'AST-1046', name:'iPhone 15 Pro', category:'Mobile', owner:'Marcus Webb', status:'Active', value:999, date:'2025-02-19'},
    {id:'AST-1047', name:'Logitech MX Master 3S', category:'Peripherals', owner:'Sarah Chen', status:'Active', value:99, date:'2025-04-30'},
    {id:'AST-1048', name:'Surface Laptop Studio', category:'Laptops', owner:'Unassigned', status:'Available', value:2199, date:'2025-05-11'},
    {id:'AST-1049', name:'LG UltraFine 5K', category:'Monitors', owner:'James Ortiz', status:'Maintenance', value:1299, date:'2024-09-27'},
    {id:'AST-1050', name:'iPad Pro 12.9"', category:'Mobile', owner:'Priya Nair', status:'Active', value:1099, date:'2025-06-20'},
    {id:'AST-1051', name:'Keychron K8 Pro', category:'Peripherals', owner:'Marcus Webb', status:'Retired', value:89, date:'2023-08-15'},
    {id:'AST-1052', name:'MacBook Air M3', category:'Laptops', owner:'Unassigned', status:'Available', value:1299, date:'2025-06-28'},
    {id:'AST-1053', name:'ASUS ProArt Display', category:'Monitors', owner:'Sarah Chen', status:'Active', value:899, date:'2025-01-05'},
  ];

  const statusBadge = {
    Active:'badge-success', Available:'badge-info', Maintenance:'badge-warning', Retired:'badge-neutral'
  };
  const categoryIcon = {
    Laptops:'fa-laptop', Monitors:'fa-desktop', Mobile:'fa-mobile-screen', Peripherals:'fa-keyboard'
  };

  const tableBody = document.getElementById('assetsTableBody');
  const searchInput = document.getElementById('tableSearch');
  const filterChips = document.querySelectorAll('.filter-chip');
  const pageInfo = document.getElementById('pageInfo');
  const paginationEl = document.getElementById('pagination');
  const PAGE_SIZE = 6;

  let state = { query:'', filter:'All', page:1, sortKey:null, sortDir:1 };

  function getFiltered(){
    let rows = ASSETS.filter(a => {
      const matchesQuery = !state.query || (a.name + a.id + a.owner).toLowerCase().includes(state.query.toLowerCase());
      const matchesFilter = state.filter === 'All' || a.status === state.filter;
      return matchesQuery && matchesFilter;
    });
    if(state.sortKey){
      rows = rows.slice().sort((a,b) => {
        const va = a[state.sortKey], vb = b[state.sortKey];
        if(typeof va === 'number') return (va - vb) * state.sortDir;
        return String(va).localeCompare(String(vb)) * state.sortDir;
      });
    }
    return rows;
  }

  function renderTable(){
    if(!tableBody) return;
    const rows = getFiltered();
    const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);
    const start = (state.page - 1) * PAGE_SIZE;
    const pageRows = rows.slice(start, start + PAGE_SIZE);

    tableBody.innerHTML = pageRows.map(a => `
      <tr>
        <td>
          <div class="cell-asset">
            <span class="thumb"><i class="fa-solid ${categoryIcon[a.category] || 'fa-box'}"></i></span>
            <div>
              <strong>${a.name}</strong>
              <small>${a.id}</small>
            </div>
          </div>
        </td>
        <td>${a.category}</td>
        <td>${a.owner}</td>
        <td><span class="badge ${statusBadge[a.status]}"><span class="dot"></span>${a.status}</span></td>
        <td class="text-mono">$${a.value.toLocaleString()}</td>
        <td class="text-mono">${a.date}</td>
        <td>
          <div class="row-actions">
            <span class="row-action-btn tooltip" data-tooltip="View"><i class="fa-regular fa-eye"></i></span>
            <span class="row-action-btn tooltip" data-tooltip="Edit"><i class="fa-regular fa-pen-to-square"></i></span>
            <span class="row-action-btn danger tooltip" data-tooltip="Remove"><i class="fa-regular fa-trash-can"></i></span>
          </div>
        </td>
      </tr>
    `).join('') || `<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--muted);">No assets match your search.</td></tr>`;

    if(pageInfo) pageInfo.textContent = `Showing ${rows.length ? start + 1 : 0}–${Math.min(start + PAGE_SIZE, rows.length)} of ${rows.length} assets`;

    if(paginationEl){
      let html = `<button class="page-btn" ${state.page === 1 ? 'disabled' : ''} data-page="${state.page - 1}"><i class="fa-solid fa-chevron-left"></i></button>`;
      for(let p = 1; p <= totalPages; p++){
        html += `<button class="page-btn ${p === state.page ? 'active' : ''}" data-page="${p}">${p}</button>`;
      }
      html += `<button class="page-btn" ${state.page === totalPages ? 'disabled' : ''} data-page="${state.page + 1}"><i class="fa-solid fa-chevron-right"></i></button>`;
      paginationEl.innerHTML = html;
      paginationEl.querySelectorAll('.page-btn').forEach(btn => {
        btn.addEventListener('click', () => { state.page = +btn.dataset.page; renderTable(); });
      });
    }
  }

  searchInput?.addEventListener('input', (e) => { state.query = e.target.value; state.page = 1; renderTable(); });
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.filter = chip.dataset.filter;
      state.page = 1;
      renderTable();
    });
  });
  document.querySelectorAll('.data-table thead th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      state.sortDir = (state.sortKey === key) ? -state.sortDir : 1;
      state.sortKey = key;
      renderTable();
    });
  });
  renderTable();

  /* ---------------- Charts ---------------- */
  if(window.Chart){
    const muted = '#64748B';
    const gridColor = '#EDF2F7';
    Chart.defaults.font.family = "Inter";

    new Chart(document.getElementById('statusChart'), {
      type:'doughnut',
      data:{
        labels:['Active','Available','Maintenance','Retired'],
        datasets:[{data:[7,3,2,1], backgroundColor:['#2563EB','#06B6D4','#F59E0B','#94A3B8'], borderWidth:0, hoverOffset:6}]
      },
      options:{
        responsive:true, maintainAspectRatio:false, cutout:'68%',
        plugins:{legend:{position:'bottom', labels:{color:muted, boxWidth:8, boxHeight:8, usePointStyle:true, padding:14, font:{size:11.5}}}}
      }
    });

    new Chart(document.getElementById('growthChart'), {
      type:'line',
      data:{
        labels:['Jan','Feb','Mar','Apr','May','Jun','Jul'],
        datasets:[{
          label:'Total assets', data:[920,965,1010,1080,1145,1210,1284],
          borderColor:'#2563EB', backgroundColor:'rgba(37,99,235,.08)', fill:true, tension:.42,
          pointRadius:3, pointBackgroundColor:'#2563EB', borderWidth:2.5
        }]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{
          x:{ticks:{color:muted,font:{size:11}}, grid:{display:false}},
          y:{beginAtZero:false, ticks:{color:muted,font:{size:11}}, grid:{color:gridColor}}
        }
      }
    });

    new Chart(document.getElementById('categoryChart'), {
      type:'bar',
      data:{
        labels:['Laptops','Monitors','Mobile','Peripherals'],
        datasets:[{data:[520,310,260,194], backgroundColor:'#2563EB', borderRadius:8, maxBarThickness:26}]
      },
      options:{
        indexAxis:'y', responsive:true, maintainAspectRatio:false,
        plugins:{legend:{display:false}},
        scales:{
          x:{beginAtZero:true, ticks:{color:muted,font:{size:11}}, grid:{color:gridColor}},
          y:{ticks:{color:muted,font:{size:11.5,weight:600}}, grid:{display:false}}
        }
      }
    });

    new Chart(document.getElementById('distributionChart'), {
      type:'pie',
      data:{
        labels:['Laptops','Monitors','Mobile','Peripherals'],
        datasets:[{data:[520,310,260,194], backgroundColor:['#2563EB','#06B6D4','#10B981','#F59E0B'], borderWidth:0, hoverOffset:6}]
      },
      options:{
        responsive:true, maintainAspectRatio:false,
        plugins:{legend:{position:'bottom', labels:{color:muted, boxWidth:8, boxHeight:8, usePointStyle:true, padding:14, font:{size:11.5}}}}
      }
    });
  }

});
