const STORAGE_KEY = "serviceDeskTickets";
const FIRST_TICKET_ID = 1001;

const seedTickets = [
  {
    id: 1001,
    requester: "Marina Costa",
    email: "marina.costa@empresa.com",
    category: "Acesso",
    priority: "Alta",
    status: "Aberto",
    title: "Senha expirada no sistema de vendas",
    description: "Ao tentar entrar no sistema de vendas, recebo a mensagem de senha expirada e não consigo redefinir pelo portal.",
    correction: "",
    createdAt: "2026-06-18T11:20:00.000Z",
    updatedAt: "2026-06-18T11:20:00.000Z",
    events: [
      "Chamado aberto por Marina Costa."
    ]
  },
  {
    id: 1002,
    requester: "Rafael Lima",
    email: "rafael.lima@empresa.com",
    category: "Hardware",
    priority: "Média",
    status: "Em atendimento",
    title: "Notebook reiniciando sozinho",
    description: "O notebook reinicia durante reuniões e apresentações. Isso ocorreu quatro vezes nesta semana.",
    correction: "Equipamento em análise para troca preventiva de memória.",
    createdAt: "2026-06-17T14:40:00.000Z",
    updatedAt: "2026-06-18T09:15:00.000Z",
    events: [
      "Chamado aberto por Rafael Lima.",
      "Status alterado para Em atendimento."
    ]
  }
];

let tickets = loadTickets();
let selectedTicketId = tickets[0]?.id ?? null;

const views = document.querySelectorAll(".view");
const tabs = document.querySelectorAll(".tab");
const ticketForm = document.querySelector("#ticketForm");
const ticketList = document.querySelector("#ticketList");
const ticketDetails = document.querySelector("#ticketDetails");
const ticketCounter = document.querySelector("#ticketCounter");
const historyTable = document.querySelector("#historyTable");
const searchInput = document.querySelector("#searchInput");
const clearData = document.querySelector("#clearData");
const toast = document.querySelector("#toast");

tabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    tabs.forEach((item) => item.classList.remove("is-active"));
    views.forEach((view) => view.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.querySelector(`#${tab.dataset.view}`).classList.add("is-active");
    render();
  });
});

ticketForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const requesterInput = document.querySelector("#requester");
  const emailInput = document.querySelector("#email");
  const titleInput = document.querySelector("#title");
  const descriptionInput = document.querySelector("#description");
  const requester = requesterInput.value.trim();
  const email = emailInput.value.trim();
  const title = titleInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!requester || !email || !title || !description) {
    const firstEmptyField = [requesterInput, emailInput, titleInput, descriptionInput]
      .find((field) => !field.value.trim());

    showToast("Preencha os campos obrigatorios sem usar apenas espacos.");
    firstEmptyField?.focus();
    return;
  }

  const formTicket = {
    id: nextId(),
    requester,
    email,
    category: document.querySelector("#category").value,
    priority: document.querySelector("#priority").value,
    status: "Aberto",
    title,
    description,
    correction: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    events: [
      `Chamado aberto por ${requester}.`
    ]
  };

  tickets.unshift(formTicket);
  selectedTicketId = formTicket.id;
  saveTickets();
  ticketForm.reset();
  showToast(`Chamado #${formTicket.id} aberto com sucesso.`);
  render();
});

searchInput.addEventListener("input", () => {
  renderTicketList();
  renderTicketDetails();
});

clearData.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  tickets = [];
  selectedTicketId = null;
  saveTickets();
  showToast("Base local limpa.");
  render();
});

function loadTickets() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTickets));
    return [...seedTickets];
  }

  try {
    const parsedTickets = JSON.parse(stored);
    const normalizedTickets = normalizeTicketIds(parsedTickets);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizedTickets));
    return normalizedTickets;
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedTickets));
    return [...seedTickets];
  }
}

function saveTickets() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
}

function nextId() {
  const validIds = tickets
    .map((ticket) => Number(ticket?.id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (validIds.length === 0) {
    return FIRST_TICKET_ID;
  }

  return Math.max(...validIds) + 1;
}

function normalizeTicketIds(ticketList) {
  if (!Array.isArray(ticketList)) {
    return [...seedTickets];
  }

  let nextValidId = nextAvailableId(ticketList);
  const usedIds = new Set();

  return ticketList.map((ticket) => {
    const safeTicket = ticket && typeof ticket === "object" ? ticket : {};
    const numericId = Number(safeTicket.id);
    const hasValidId = Number.isInteger(numericId) && numericId > 0 && !usedIds.has(numericId);
    const id = hasValidId ? numericId : nextValidId;
    const now = new Date().toISOString();
    const createdAt = isValidDate(safeTicket.createdAt) ? safeTicket.createdAt : now;
    const updatedAt = isValidDate(safeTicket.updatedAt) ? safeTicket.updatedAt : createdAt;

    usedIds.add(id);

    while (usedIds.has(nextValidId)) {
      nextValidId += 1;
    }

    return {
      ...safeTicket,
      id,
      requester: String(safeTicket.requester ?? "").trim() || "Solicitante nao informado",
      email: String(safeTicket.email ?? "").trim(),
      category: String(safeTicket.category ?? "").trim() || "Outro",
      priority: String(safeTicket.priority ?? "").trim() || "Baixa",
      status: String(safeTicket.status ?? "").trim() || "Aberto",
      title: String(safeTicket.title ?? "").trim() || "Chamado sem titulo",
      description: String(safeTicket.description ?? "").trim() || "Descricao nao informada",
      correction: String(safeTicket.correction ?? "").trim(),
      createdAt,
      updatedAt,
      events: Array.isArray(safeTicket.events) ? safeTicket.events : []
    };
  });
}

function nextAvailableId(ticketList) {
  const validIds = ticketList
    .map((ticket) => Number(ticket?.id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (validIds.length === 0) {
    return FIRST_TICKET_ID;
  }

  return Math.max(...validIds) + 1;
}

function isValidDate(value) {
  return !Number.isNaN(new Date(value).getTime());
}

function render() {
  renderTicketList();
  renderTicketDetails();
  renderHistory();
}

function renderTicketList() {
  const term = searchInput.value.trim().toLowerCase();
  const filteredTickets = tickets.filter((ticket) => {
    const searchableContent = [
      ticket.id,
      ticket.title,
      ticket.requester,
      ticket.email,
      ticket.createdAt,
      ticket.updatedAt,
      formatSearchDate(ticket.createdAt),
      formatSearchDate(ticket.updatedAt)
    ].join(" ").toLowerCase();

    return searchableContent.includes(term);
  });

  if (!filteredTickets.some((ticket) => ticket.id === selectedTicketId)) {
    selectedTicketId = filteredTickets[0]?.id ?? null;
  }

  ticketCounter.textContent = `${filteredTickets.length} chamado${filteredTickets.length === 1 ? "" : "s"}`;

  if (filteredTickets.length === 0) {
    ticketList.innerHTML = '<div class="empty-state"><p>Nenhum chamado encontrado.</p></div>';
    return;
  }

  ticketList.innerHTML = filteredTickets.map((ticket) => `
    <button class="ticket-card ${ticket.id === selectedTicketId ? "is-selected" : ""}" data-ticket-id="${ticket.id}">
      <span class="ticket-title">#${ticket.id} - ${escapeHtml(ticket.title)}</span>
      <span class="ticket-meta">${escapeHtml(ticket.requester)} • ${formatDate(ticket.updatedAt)}</span>
      <span class="badge-row">
        <span class="badge ${statusClass(ticket.status)}">${ticket.status}</span>
        <span class="badge ${priorityClass(ticket.priority)}">${ticket.priority}</span>
      </span>
    </button>
  `).join("");

  document.querySelectorAll(".ticket-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedTicketId = Number(card.dataset.ticketId);
      renderTicketList();
      renderTicketDetails();
    });
  });
}

function renderTicketDetails() {
  const ticket = tickets.find((item) => item.id === selectedTicketId);

  if (!ticket) {
    ticketDetails.innerHTML = `
      <div class="empty-state">
        <h3>Selecione um chamado</h3>
        <p>Ao escolher um item da fila, os campos de status, prioridade e correção aparecem aqui.</p>
      </div>
    `;
    return;
  }

  const ticketEvents = Array.isArray(ticket.events) ? ticket.events : [];

  ticketDetails.innerHTML = `
    <div class="details-header">
      <div>
        <p class="eyebrow">Chamado #${ticket.id}</p>
        <h3>${escapeHtml(ticket.title)}</h3>
        <p class="ticket-meta">Aberto por ${escapeHtml(ticket.requester)} em ${formatDate(ticket.createdAt)}</p>
      </div>
      <span class="badge ${statusClass(ticket.status)}">${ticket.status}</span>
    </div>

    <div class="details-grid">
      <label>
        Status
        <select id="detailStatus">
          <option ${ticket.status === "Aberto" ? "selected" : ""}>Aberto</option>
          <option ${ticket.status === "Em atendimento" ? "selected" : ""}>Em atendimento</option>
          <option ${ticket.status === "Aguardando usuário" ? "selected" : ""}>Aguardando usuário</option>
          <option ${ticket.status === "Resolvido" ? "selected" : ""}>Resolvido</option>
        </select>
      </label>
      <label>
        Prioridade
        <select id="detailPriority">
          <option ${ticket.priority === "Baixa" ? "selected" : ""}>Baixa</option>
          <option ${ticket.priority === "Média" ? "selected" : ""}>Média</option>
          <option ${ticket.priority === "Alta" ? "selected" : ""}>Alta</option>
          <option ${ticket.priority === "Crítica" ? "selected" : ""}>Crítica</option>
        </select>
      </label>
    </div>

    <label>
      Descrever correção
      <textarea id="detailCorrection" rows="5" placeholder="Informe a solução aplicada ou próxima ação.">${escapeHtml(ticket.correction)}</textarea>
    </label>

    <div class="description-box">
      <strong>Descrição do usuário</strong>
      <p>${escapeHtml(ticket.description)}</p>
      <p class="ticket-meta">${escapeHtml(ticket.category)} • ${escapeHtml(ticket.email)}</p>
    </div>

    <div class="form-actions">
      <button class="primary" id="saveTicket">Salvar alterações</button>
    </div>

    <div class="history-box">
      <strong>Histórico deste chamado</strong>
      <ul>
        ${ticketEvents.map((event) => `<li class="history-line">${escapeHtml(event)}</li>`).join("")}
      </ul>
    </div>
  `;

  document.querySelector("#saveTicket").addEventListener("click", () => updateSelectedTicket(ticket.id));
}

function updateSelectedTicket(ticketId) {
  const ticket = tickets.find((item) => item.id === ticketId);
  if (!ticket) return;

  const newStatus = document.querySelector("#detailStatus").value;
  const newPriority = document.querySelector("#detailPriority").value;
  const newCorrection = document.querySelector("#detailCorrection").value.trim();
  const eventList = [];

  const statusChanged = ticket.status !== newStatus;
  const priorityChanged = ticket.priority !== newPriority;
  const correctionChanged = ticket.correction !== newCorrection;

  if (!statusChanged && !priorityChanged && !correctionChanged) {
    showToast("Nenhuma alteração para salvar.");
    return;
  }

  if (statusChanged) {
    eventList.push(`Status alterado de ${ticket.status} para ${newStatus}.`);
  }

  if (priorityChanged) {
    eventList.push(`Prioridade alterada de ${ticket.priority} para ${newPriority}.`);
  }

  if (correctionChanged) {
    eventList.push(newCorrection ? `Correção registrada: ${newCorrection}` : "Correção removida.");
  }

  ticket.status = newStatus;
  ticket.priority = newPriority;
  ticket.correction = newCorrection;
  ticket.updatedAt = new Date().toISOString();
  ticket.events = (Array.isArray(ticket.events) ? ticket.events : []).concat(eventList);

  saveTickets();
  showToast(`Chamado #${ticket.id} atualizado.`);
  render();
}

function renderHistory() {
  if (tickets.length === 0) {
    historyTable.innerHTML = `
      <tr>
        <td colspan="7">Nenhum chamado registrado.</td>
      </tr>
    `;
    return;
  }

  historyTable.innerHTML = tickets.map((ticket) => `
    <tr>
      <td>#${ticket.id}</td>
      <td>${escapeHtml(ticket.title)}</td>
      <td>${escapeHtml(ticket.requester)}</td>
      <td><span class="badge ${statusClass(ticket.status)}">${ticket.status}</span></td>
      <td><span class="badge ${priorityClass(ticket.priority)}">${ticket.priority}</span></td>
      <td>${formatDate(ticket.updatedAt)}</td>
      <td>
        ${(Array.isArray(ticket.events) ? ticket.events : []).map((event) => `<div>${escapeHtml(event)}</div>`).join("")}
      </td>
    </tr>
  `).join("");
}

function statusClass(status) {
  return `status-${String(status ?? "").toLowerCase().replaceAll(" ", "-")}`;
}

function priorityClass(priority) {
  return `priority-${String(priority ?? "").toLowerCase()}`;
}

function formatDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Data nao informada";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function formatSearchDate(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("is-visible");
  setTimeout(() => toast.classList.remove("is-visible"), 2600);
}

render();
