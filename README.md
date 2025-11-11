# Event-Dental

## Развёртывание на Netlify

1. Создайте новый сайт в Netlify и подключите этот репозиторий.
2. На шаге настроек убедитесь, что **Build command** оставлен пустым, а **Publish directory** равен `.`.
   Эти значения также указаны в файле [`netlify.toml`](netlify.toml), поэтому Netlify подхватит их автоматически.
3. Выполните деплой — статические файлы будут отданы без сборки, а правило редиректа гарантирует, что главная страница `index.html` открывается по любой ссылке.

Альтернативно можно использовать drag-and-drop деплой: заранее подготовьте набор файлов (`index.html`, `styles.css`, `app.js`, [`_redirects`](_redirects)) и перетащите их в Netlify Drop. Обратите внимание, что drag-and-drop не читает `netlify.toml`, поэтому файл `_redirects` необходим для корректной работы маршрутизации.

## Получение файлов без архива

Ниже приведено содержимое всех файлов проекта, чтобы их можно было скопировать по отдельности и сохранить у себя локально:

### `index.html`
```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Управление посадкой — Кинозал</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <header class="page-header">
      <div class="page-header__inner">
        <h1 class="page-title">Управление посадкой в кинозале</h1>
        <p class="page-subtitle">
          Настройте схему зала, обновляйте статусы мест и делитесь актуальной
          рассадкой с командой.
        </p>
      </div>
    </header>

    <main class="layout">
      <section class="panel panel--admin">
        <div class="panel__section">
          <h2 class="panel__title">Режим организатора</h2>
          <form id="admin-form" class="form form--inline" autocomplete="off">
            <label class="form__field">
              <span class="form__label">Пароль</span>
              <input
                id="admin-password"
                type="password"
                name="password"
                class="input"
                placeholder="Введите пароль"
                required
              />
            </label>
            <button type="submit" class="button">Войти</button>
            <button type="button" id="admin-logout" class="button button--ghost">
              Выйти
            </button>
          </form>
          <p id="admin-status" class="panel__hint">Доступ закрыт. Вы в режиме просмотра.</p>
        </div>

        <div class="panel__section" id="settings-section">
          <h2 class="panel__title">Настройка зала</h2>
          <form id="settings-form" class="form" autocomplete="off">
            <label class="form__field">
              <span class="form__label">Количество рядов</span>
              <input
                id="rows-input"
                type="number"
                min="1"
                max="50"
                class="input"
                placeholder="Например, 8"
              />
            </label>

            <label class="form__field">
              <span class="form__label">
                Места в каждом ряду
                <span class="form__label-hint">Одно число или список через запятую</span>
              </span>
              <input
                id="seats-pattern-input"
                type="text"
                class="input"
                placeholder="Например, 10 или 8,10,10,8"
              />
            </label>

            <div class="form__actions">
              <button type="submit" class="button button--primary">Обновить схему</button>
            </div>
          </form>
        </div>

        <div class="panel__section panel__section--legend">
          <h2 class="panel__title">Легенда</h2>
          <ul class="legend">
            <li class="legend__item">
              <span class="legend__swatch legend__swatch--available"></span>
              Свободно
            </li>
            <li class="legend__item">
              <span class="legend__swatch legend__swatch--occupied"></span>
              Занято
            </li>
          </ul>
        </div>
      </section>

      <section class="panel panel--seats">
        <header class="panel__header">
          <h2 class="panel__title">Схема зала</h2>
          <p class="panel__hint">
            Ряды нумеруются сверху вниз, места — слева направо. Нажмите на место в режиме
            организатора, чтобы изменить статус и текст.
          </p>
        </header>
        <div id="seat-grid" class="seat-grid" role="grid" aria-live="polite"></div>
      </section>
    </main>

    <dialog id="seat-modal" class="seat-modal">
      <form method="dialog" class="seat-modal__form" id="seat-modal-form">
        <h3 class="seat-modal__title">Настройки места</h3>
        <p class="seat-modal__subtitle" id="seat-modal-position"></p>

        <fieldset class="form__field seat-modal__field">
          <legend class="form__label">Статус</legend>
          <label class="radio">
            <input type="radio" name="seat-status" value="available" checked />
            <span>Свободно</span>
          </label>
          <label class="radio">
            <input type="radio" name="seat-status" value="occupied" />
            <span>Занято</span>
          </label>
        </fieldset>

        <label class="form__field seat-modal__field">
          <span class="form__label">Текст в ячейке</span>
          <textarea
            id="seat-modal-text"
            class="input input--textarea"
            rows="3"
            placeholder="Например: VIP или Имя гостя"
          ></textarea>
        </label>

        <div class="seat-modal__actions">
          <button type="submit" class="button button--primary">Сохранить</button>
          <button type="button" class="button" id="seat-modal-reset">Очистить</button>
          <button type="button" class="button button--ghost" id="seat-modal-cancel">Отмена</button>
        </div>
      </form>
    </dialog>

    <template id="seat-template">
      <button type="button" class="seat" role="gridcell"></button>
    </template>

    <script src="app.js" defer></script>
  </body>
</html>
```

### `styles.css`
```css
:root {
  --color-bg: #f5f7fb;
  --color-panel: #ffffff;
  --color-text: #1f2430;
  --color-muted: #6b7280;
  --color-border: #d9dfec;
  --color-primary: #2563eb;
  --color-primary-dark: #1d4ed8;
  --color-available: #22c55e;
  --color-occupied: #ef4444;
  --shadow-soft: 0 10px 30px rgba(15, 23, 42, 0.08);
  font-family: "Inter", "Segoe UI", sans-serif;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: inherit;
  min-height: 100vh;
}

.page-header {
  background: linear-gradient(120deg, #111827, #1f2937);
  color: #f9fafb;
  padding: 48px 24px 40px;
}

.page-header__inner {
  max-width: 1100px;
  margin: 0 auto;
}

.page-title {
  margin: 0;
  font-size: 32px;
  font-weight: 700;
}

.page-subtitle {
  margin: 8px 0 0;
  max-width: 680px;
  font-size: 16px;
  line-height: 1.5;
}

.layout {
  max-width: 1100px;
  margin: -32px auto 48px;
  display: grid;
  grid-template-columns: minmax(280px, 340px) 1fr;
  gap: 24px;
  padding: 0 24px;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
    margin-top: -16px;
  }
}

.panel {
  background: var(--color-panel);
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
  padding: 28px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.panel__header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.panel__section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.panel__hint {
  margin: 0;
  font-size: 14px;
  color: var(--color-muted);
  line-height: 1.5;
}

.panel__hint--error {
  color: var(--color-occupied);
  font-weight: 600;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form--inline {
  flex-direction: row;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 12px;
}

.form__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 180px;
}

.form__label {
  font-size: 14px;
  font-weight: 500;
}

.form__label-hint {
  display: block;
  font-size: 12px;
  font-weight: 400;
  color: var(--color-muted);
  margin-top: 4px;
}

.input {
  border: 1px solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
  background: #fff;
}

.input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.2);
}

.input--textarea {
  resize: vertical;
}

.form__actions {
  margin-top: 8px;
}

.button {
  appearance: none;
  border: none;
  border-radius: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  background: var(--color-border);
  color: var(--color-text);
  transition: background 0.2s, transform 0.2s;
}

.button:hover {
  transform: translateY(-1px);
}

.button:active {
  transform: translateY(0);
}

.button--primary {
  background: var(--color-primary);
  color: white;
}

.button--primary:hover {
  background: var(--color-primary-dark);
}

.button--ghost {
  background: transparent;
  border: 1px solid var(--color-border);
}

.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.legend__item {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
}

.legend__swatch {
  width: 18px;
  height: 18px;
  border-radius: 6px;
  border: 2px solid rgba(17, 24, 39, 0.08);
}

.legend__swatch--available {
  background: var(--color-available);
}

.legend__swatch--occupied {
  background: var(--color-occupied);
}

.seat-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.seat-row {
  display: grid;
  gap: 8px;
  align-items: center;
  grid-template-columns: 80px repeat(auto-fit, minmax(60px, 1fr));
}

.seat-row__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-muted);
  justify-self: start;
}

.seat {
  position: relative;
  border-radius: 12px;
  padding: 10px;
  min-height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  font-size: 13px;
  line-height: 1.4;
  border: 2px solid transparent;
  color: white;
  background: var(--color-available);
  transition: transform 0.2s, box-shadow 0.2s, filter 0.2s;
}

.seat--available {
  background: var(--color-available);
}

.seat span {
  display: block;
}

.seat__number {
  font-weight: 600;
  font-size: 12px;
  opacity: 0.9;
}

.seat__label {
  font-weight: 500;
  font-size: 13px;
  margin-top: 4px;
}

.seat--occupied {
  background: var(--color-occupied);
}

body.is-admin .seat {
  cursor: pointer;
}

body.is-admin .seat:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.18);
}

body:not(.is-admin) .seat {
  cursor: default;
}

.seat--occupied .seat__number {
  color: rgba(255, 255, 255, 0.85);
}

.seat--available .seat__label {
  color: rgba(255, 255, 255, 0.9);
}

.seat-modal {
  border: none;
  border-radius: 16px;
  padding: 0;
  max-width: 360px;
  width: 100%;
  box-shadow: var(--shadow-soft);
}

.seat-modal::backdrop {
  background: rgba(15, 23, 42, 0.45);
}

.seat-modal__form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.seat-modal__title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

.seat-modal__subtitle {
  margin: 0;
  color: var(--color-muted);
  font-size: 14px;
}

.radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
}

.radio input {
  accent-color: var(--color-primary);
}

.seat-modal__actions {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.panel--admin[aria-disabled="true"] {
  opacity: 0.7;
}

body:not(.is-admin) #settings-section {
  opacity: 0.6;
}

body:not(.is-admin) #settings-section .input,
body:not(.is-admin) #settings-section .button {
  pointer-events: none;
}

body:not(.is-admin) #settings-section .button.button--primary {
  background: var(--color-border);
  color: var(--color-muted);
}

@media (max-width: 600px) {
  .seat-row {
    grid-template-columns: 60px repeat(auto-fit, minmax(50px, 1fr));
  }

  .seat {
    min-height: 50px;
    font-size: 12px;
    border-radius: 10px;
  }

  .form--inline {
    flex-direction: column;
    align-items: stretch;
  }
}
```

### `app.js`
```javascript
const STORAGE_KEY = 'cinema-seat-map-v1';
const ADMIN_PASSWORD = 'organizer2024';
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

function handleSettingsSubmit(event) {
  event.preventDefault();

  if (!isAdmin) {
    return;
  }

  const rowsValue = parseInt(rowsInput.value, 10);
  const seatsPatternValue = seatsPatternInput.value.trim();

  if (!Number.isInteger(rowsValue) || rowsValue <= 0) {
    adminStatusText.textContent = 'Укажите корректное количество рядов.';
    adminStatusText.classList.add('panel__hint--error');
    rowsInput.focus();
    return;
  }

  const seatsPerRow = parseSeatsPattern(seatsPatternValue, rowsValue);
  if (!seatsPerRow) {
    adminStatusText.textContent = 'Укажите количество мест: одно число или список через запятую.';
    adminStatusText.classList.add('panel__hint--error');
    seatsPatternInput.focus();
    return;
  }

  applySeatConfiguration(rowsValue, seatsPerRow);
  saveState();
  renderSeatGrid();
  adminStatusText.textContent = 'Схема обновлена и сохранена.';
  adminStatusText.classList.remove('panel__hint--error');
}

function parseSeatsPattern(input, rowsValue) {
  if (!input) {
    return Array.from({ length: rowsValue }, () => DEFAULT_SEATS_PER_ROW);
  }

  if (/^\d+$/.test(input)) {
    const seatsCount = Number.parseInt(input, 10);
    if (seatsCount <= 0) {
      return null;
    }
    return Array.from({ length: rowsValue }, () => seatsCount);
  }

  const parts = input.split(',').map((part) => part.trim()).filter(Boolean);
  if (!parts.length) {
    return null;
  }

  const seatsPerRow = parts.map((part) => Number.parseInt(part, 10));
  if (seatsPerRow.some((count) => !Number.isInteger(count) || count <= 0)) {
    return null;
  }

  if (seatsPerRow.length < rowsValue) {
    const lastValue = seatsPerRow[seatsPerRow.length - 1];
    while (seatsPerRow.length < rowsValue) {
      seatsPerRow.push(lastValue);
    }
  }

  if (seatsPerRow.length > rowsValue) {
    seatsPerRow.length = rowsValue;
  }

  return seatsPerRow;
}

function applySeatConfiguration(rowsValue, seatsPerRow) {
  state.rows = rowsValue;
  state.seatsPerRow = seatsPerRow;

  const newSeats = {};
  for (let rowIndex = 1; rowIndex <= rowsValue; rowIndex += 1) {
    const seatsInRow = seatsPerRow[rowIndex - 1];
    for (let seatIndex = 1; seatIndex <= seatsInRow; seatIndex += 1) {
      const seatId = `${rowIndex}-${seatIndex}`;
      const existingSeat = state.seats[seatId];
      newSeats[seatId] = existingSeat
        ? { ...existingSeat }
        : { status: 'available', label: '' };
    }
  }

  state.seats = newSeats;
}

function updateAdminUI() {
  document.body.classList.toggle('is-admin', isAdmin);
  adminStatusText.classList.toggle('panel__hint--error', false);
  adminStatusText.textContent = isAdmin
    ? 'Доступ открыт. Можно редактировать схему.'
    : 'Доступ закрыт. Вы в режиме просмотра.';
  adminPasswordInput.disabled = isAdmin;
  settingsForm.querySelectorAll('input, button').forEach((element) => {
    element.disabled = !isAdmin;
  });
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
```

### `netlify.toml`
```toml
[build]
  publish = "."
  command = ""

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```
