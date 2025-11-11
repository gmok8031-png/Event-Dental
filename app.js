const STORAGE_KEY = 'cinema-seat-map-v1';
const ADMIN_PASSWORD = 'david03';
const DEFAULT_ROWS = 6;
const DEFAULT_SEATS_PER_ROW = 10;

const adminForm = document.getElementById('admin-form');
const adminPasswordInput = document.getElementById('admin-password');
const adminStatusText = document.getElementById('admin-status');
const adminLogoutButton = document.getElementById('admin-logout');
const settingsForm = document.getElementById('settings-form');
const rowsInput = document.getElementById('rows-input');
const seatsPatternInput = document.getElementById('seats-pattern-input');
const seatGrid = document.getElementById('seat-grid');
const seatTemplate = document.getElementById('seat-template');
const seatModal = document.getElementById('seat-modal');
const seatModalForm = document.getElementById('seat-modal-form');
const seatModalPosition = document.getElementById('seat-modal-position');
const seatModalText = document.getElementById('seat-modal-text');
const seatModalReset = document.getElementById('seat-modal-reset');
const seatModalCancel = document.getElementById('seat-modal-cancel');

let isAdmin = false;
let activeSeatId = null;

const state = {
  rows: 0,
  seatsPerRow: [],
  seats: {},
};

init();

function init() {
  const savedState = loadState();
  if (savedState) {
    state.rows = savedState.rows;
    state.seatsPerRow = savedState.seatsPerRow;
    state.seats = savedState.seats;
  } else {
    applyDefaultState();
    saveState();
  }

  updateSettingsForm();
  renderSeatGrid();
  updateAdminUI();
  bindEvents();
}

function bindEvents() {
  adminForm.addEventListener('submit', handleAdminLogin);
  adminLogoutButton.addEventListener('click', handleAdminLogout);
  settingsForm.addEventListener('submit', handleSettingsSubmit);

  seatGrid.addEventListener('click', (event) => {
    const seatElement = event.target.closest('.seat');
    if (!seatElement || !isAdmin) {
      return;
    }
    openSeatModal(seatElement);
  });

  seatModalForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!activeSeatId) {
      closeSeatModal();
      return;
    }

    const formData = new FormData(seatModalForm);
    const status = formData.get('seat-status') || 'available';
    const text = seatModalText.value.trim();
    const seatData = state.seats[activeSeatId];
    if (!seatData) {
      closeSeatModal();
      return;
    }

    seatData.status = status;
    seatData.label = text;
    saveState();
    renderSeatGrid();
    closeSeatModal();
  });

  seatModalReset.addEventListener('click', () => {
    const defaultRadio = seatModalForm.querySelector('input[name="seat-status"][value="available"]');
    if (defaultRadio) {
      defaultRadio.checked = true;
    }
    seatModalText.value = '';
  });

  seatModalCancel.addEventListener('click', () => {
    closeSeatModal();
  });

  if (seatModal) {
    seatModal.addEventListener('cancel', (event) => {
      event.preventDefault();
      closeSeatModal();
    });
  }
}

function handleAdminLogin(event) {
  event.preventDefault();
  const password = adminPasswordInput.value.trim();
  if (password === ADMIN_PASSWORD) {
    isAdmin = true;
    adminPasswordInput.value = '';
    updateAdminUI();
  } else {
    adminStatusText.textContent = 'Неверный пароль. Попробуйте снова.';
    adminStatusText.classList.add('panel__hint--error');
    adminPasswordInput.focus();
  }
}

function handleAdminLogout() {
  if (!isAdmin) {
    return;
  }
  isAdmin = false;
  updateAdminUI();
}

function updateAdminUI() {
  document.body.classList.toggle('is-admin', isAdmin);
  adminPasswordInput.disabled = isAdmin;
  adminLogoutButton.disabled = !isAdmin;
  adminForm.querySelector('button[type="submit"]').disabled = isAdmin;
  rowsInput.disabled = !isAdmin;
  seatsPatternInput.disabled = !isAdmin;
  const settingsSubmit = settingsForm.querySelector('button[type="submit"]');
  if (settingsSubmit) {
    settingsSubmit.disabled = !isAdmin;
  }

  if (isAdmin) {
    adminStatusText.textContent = 'Доступ открыт. Вы можете редактировать схему.';
    adminStatusText.classList.remove('panel__hint--error');
  } else {
    adminStatusText.textContent = 'Доступ закрыт. Вы в режиме просмотра.';
    adminStatusText.classList.remove('panel__hint--error');
  }
}

function handleSettingsSubmit(event) {
  event.preventDefault();
  if (!isAdmin) {
    return;
  }

  const rowsValue = parseInt(rowsInput.value, 10);
  const rows = Number.isInteger(rowsValue) && rowsValue > 0 ? Math.min(rowsValue, 50) : state.rows;
  const patternRaw = seatsPatternInput.value.trim();
  const seatsPerRow = resolveSeatPattern(patternRaw, rows);

  const nextSeats = {};
  for (let rowIndex = 1; rowIndex <= rows; rowIndex += 1) {
    const seatsInRow = seatsPerRow[rowIndex - 1];
    for (let seatIndex = 1; seatIndex <= seatsInRow; seatIndex += 1) {
      const seatId = `${rowIndex}-${seatIndex}`;
      const existingSeat = state.seats[seatId];
      nextSeats[seatId] = existingSeat
        ? { ...existingSeat }
        : { status: 'available', label: '' };
    }
  }

  state.rows = rows;
  state.seatsPerRow = seatsPerRow;
  state.seats = nextSeats;
  saveState();
  renderSeatGrid();
  updateSettingsForm();
}

function resolveSeatPattern(patternRaw, rows) {
  if (!patternRaw) {
    return Array.from({ length: rows }, () => DEFAULT_SEATS_PER_ROW);
  }

  const parts = patternRaw
    .split(',')
    .map((part) => parseInt(part.trim(), 10))
    .filter((value) => Number.isInteger(value) && value > 0);

  if (parts.length === 0) {
    return Array.from({ length: rows }, () => DEFAULT_SEATS_PER_ROW);
  }

  const seatsPerRow = [];
  for (let i = 0; i < rows; i += 1) {
    seatsPerRow[i] = parts[i] ?? parts[parts.length - 1];
    seatsPerRow[i] = Math.min(seatsPerRow[i], 50);
  }
  return seatsPerRow;
}

function renderSeatGrid() {
  seatGrid.innerHTML = '';

  if (!state.rows || state.rows <= 0) {
    const emptyMessage = document.createElement('p');
    emptyMessage.className = 'panel__hint';
    emptyMessage.textContent = 'Схема пока не настроена. Перейдите в режим организатора, чтобы задать параметры.';
    seatGrid.appendChild(emptyMessage);
    return;
  }

  for (let rowIndex = 1; rowIndex <= state.rows; rowIndex += 1) {
    const rowElement = document.createElement('div');
    rowElement.className = 'seat-row';
    rowElement.setAttribute('role', 'row');

    const rowLabel = document.createElement('div');
    rowLabel.className = 'seat-row__label';
    rowLabel.textContent = `Ряд ${rowIndex}`;
    rowElement.appendChild(rowLabel);

    const seatsInRow = state.seatsPerRow[rowIndex - 1] ?? DEFAULT_SEATS_PER_ROW;
    for (let seatIndex = 1; seatIndex <= seatsInRow; seatIndex += 1) {
      const seatId = `${rowIndex}-${seatIndex}`;
      const seatData = state.seats[seatId] ?? { status: 'available', label: '' };
      state.seats[seatId] = seatData;

      const seatButton = seatTemplate.content.firstElementChild.cloneNode(true);
      seatButton.dataset.seatId = seatId;
      seatButton.dataset.row = rowIndex;
      seatButton.dataset.seat = seatIndex;
      seatButton.classList.remove('seat--available', 'seat--occupied');
      seatButton.classList.add(`seat--${seatData.status}`);

      seatButton.innerHTML = '';

      const seatNumber = document.createElement('span');
      seatNumber.className = 'seat__number';
      seatNumber.textContent = `Ряд ${rowIndex} · Место ${seatIndex}`;

      const seatLabel = document.createElement('span');
      seatLabel.className = 'seat__label';
      seatLabel.textContent = seatData.label || '';

      seatButton.appendChild(seatNumber);
      if (seatData.label) {
        seatButton.appendChild(seatLabel);
      }

      seatButton.setAttribute('aria-label', buildSeatAriaLabel(rowIndex, seatIndex, seatData));
      rowElement.appendChild(seatButton);
    }

    seatGrid.appendChild(rowElement);
  }
}

function buildSeatAriaLabel(rowIndex, seatIndex, seatData) {
  const base = `Ряд ${rowIndex}, место ${seatIndex}`;
  const statusText = seatData.status === 'occupied' ? 'занято' : 'свободно';
  if (seatData.label) {
    return `${base}. ${statusText}. Комментарий: ${seatData.label}`;
  }
  return `${base}. ${statusText}.`;
}

function openSeatModal(seatElement) {
  const seatId = seatElement.dataset.seatId;
  activeSeatId = seatId;
  const seatData = state.seats[seatId];
  const row = seatElement.dataset.row;
  const seat = seatElement.dataset.seat;

  seatModalPosition.textContent = `Ряд ${row}, Место ${seat}`;

  const statusInputs = seatModalForm.querySelectorAll('input[name="seat-status"]');
  statusInputs.forEach((input) => {
    input.checked = input.value === (seatData?.status ?? 'available');
  });

  seatModalText.value = seatData?.label ?? '';

  if (typeof seatModal.showModal === 'function') {
    seatModal.showModal();
  } else {
    seatModal.setAttribute('open', 'open');
  }
}

function closeSeatModal() {
  activeSeatId = null;
  seatModalForm.reset();
  if (typeof seatModal.close === 'function' && seatModal.open) {
    seatModal.close();
  } else {
    seatModal.removeAttribute('open');
  }
}

function loadState() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    const rows = Number.isInteger(parsed.rows) ? parsed.rows : DEFAULT_ROWS;
    const seatsPerRow = Array.isArray(parsed.seatsPerRow) ? parsed.seatsPerRow : [];
    const seats = parsed.seats && typeof parsed.seats === 'object' ? parsed.seats : {};
    return {
      rows,
      seatsPerRow,
      seats,
    };
  } catch (error) {
    console.error('Не удалось загрузить сохранённую схему:', error);
    return null;
  }
}

function saveState() {
  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        rows: state.rows,
        seatsPerRow: state.seatsPerRow,
        seats: state.seats,
      })
    );
  } catch (error) {
    console.error('Не удалось сохранить схему:', error);
  }
}

function applyDefaultState() {
  state.rows = DEFAULT_ROWS;
  state.seatsPerRow = Array.from({ length: DEFAULT_ROWS }, () => DEFAULT_SEATS_PER_ROW);
  state.seats = {};
  for (let rowIndex = 1; rowIndex <= state.rows; rowIndex += 1) {
    for (let seatIndex = 1; seatIndex <= DEFAULT_SEATS_PER_ROW; seatIndex += 1) {
      const seatId = `${rowIndex}-${seatIndex}`;
      state.seats[seatId] = { status: 'available', label: '' };
    }
  }
}

function updateSettingsForm() {
  rowsInput.value = state.rows;
  seatsPatternInput.value = state.seatsPerRow.join(', ');
}
