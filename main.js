const CLIENT_ID = "3c0d2422-e6d8-43c4-90e8-431f6cdd4a33";
const SECRET_KEY =
  "cfH4RzKVSqou9Hyvsam3xUM1g9RSC13DTiN4nDTejWOnkI4bthso8EBxMJYLmiWS";

const app = document.getElementById("app");

const currentUrl = new URL(window.location.href);
const code = currentUrl.searchParams.get("code");

const userBaseUrl = "https://ilyaprikhodko22.amocrm.ru";
const authUrl = `${userBaseUrl}/oauth2/access_token`;
const leadsUrl = `${userBaseUrl}/api/v4/leads`;

let access_token;
let refresh_token;

let mainLeads;

let currentPage = 1;
let currentLimit = 250;

const selectElement = document.getElementById("select");

const pageSpanElement = document.getElementById("page");
const prevButtonElement = document.getElementById("prev");
const nextButtonElement = document.getElementById("next");

prevButtonElement.addEventListener("click", async () => {
  if (currentPage === 1) return;
  const prevPage = currentPage - 1;
  const { leads, page } = await getLeads(prevPage, currentLimit);
  createTableFromJSON(leads);
  pageSpanElement.innerText = prevPage;

  mainLeads = leads;
  currentPage = page;
});

nextButtonElement.addEventListener("click", async () => {
  const nextPage = currentPage + 1;

  try {
    const { leads, page } = await getLeads(nextPage, currentLimit);
    createTableFromJSON(leads);
    pageSpanElement.innerText = nextPage;

    mainLeads = leads;
    currentPage = page;
  } catch (error) {
    console.error(error);
  }
});

selectElement.addEventListener("change", async (event) => {
  const value = event.target.value;
  currentLimit = value;

  if (value === "all") {
    const { leads } = await getLeads();
    createTableFromJSON(leads);
    mainLeads = leads;
    currentPage = 1;
    currentLimit = 250;
  } else {
    const { leads, page } = await getLeads(currentPage, value);
    createTableFromJSON(leads);
    mainLeads = leads;
    currentPage = page;
  }

  pageSpanElement.innerText = currentPage;
});

// ===============

const authButtonElement = document.getElementById("auth");

authButtonElement.addEventListener("click", () => {
  auth();
});

/**
 * Открывает новое окно для начала процесса аутентификации.
 *
 */
function auth() {
  window.open(
    `https://www.amocrm.ru/oauth?client_id=${CLIENT_ID}&state=${123}&mode=post_message`,
    "Предоставить доступ",
    "scrollbars, status, resizable, width=750, height=580",
  );
}

// ===============

init();

/**
 * Инициализирует функцию, получая данные о токенах и лидах, устанавливая токены доступа и обновления,
 * и обновляет пользовательский интерфейс для отображения таблицы сделок и соответствующих элементов
 *
 */
async function init() {
  const tokensData = await getTokens();

  if (!tokensData) {
    return;
  }

  access_token = tokensData.access_token;
  refresh_token = tokensData.refresh_token;

  const { leads } = await getLeads();
  const wrapper = document.getElementById("wrapper");
  const title = document.getElementById("title");

  wrapper.style.display = "block";
  authButtonElement.style.display = "none";
  title.style.display = "block";

  createTableFromJSON(leads);
  mainLeads = leads;
}

/**
 * Асинхронно извлекает токены из указанного URL-адреса аутентификации, используя предоставленный код.
 *
 * @return {Object} JSON-объект, содержащий полученные токены.
 */
async function getTokens() {
  if (!code) {
    console.error("Error! Something went wrong!");
    return;
  }

  const response = await fetch(authUrl, {
    method: "POST",
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: SECRET_KEY,
      grant_type: "authorization_code",
      code,
      redirect_uri: "https://acmocrm-test.vercel.app",
    }),
    headers: {
      "Content-Type": "application/json",
      Host: "ilyaprikhodko22.amocrm.ru",
    },
  });

  const json = await response.json();

  return json;
}

/**
 * Асинхронно извлекает сделки с указанной страницы с номером страницы по умолчанию 1 и ограничением в 250 записей.
 *
 * @param {number} page - Номер страницы, с которой будут получены сделки.
 * @param {number} limit - Максимальное количество
 * @return {Object} Объект, содержащий полученные ссылки и номер страницы
 */
async function getLeads(page = 1, limit = 250) {
  if (!access_token) {
    console.error("Error! Something went wrong!");
    return;
  }

  const params = new URLSearchParams({ page, limit });

  const response = await fetch(leadsUrl + "?" + params, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });

  const json = await response.json();

  return { leads: json?._embedded?.leads, page: json?._page };
}

/**
 * Создает таблицу из заданных JSON-данных и добавляет ее в контейнер таблиц в DOM.
 *
 * @param {Array} leads - JSON-данные, из которых нужно создать таблицу
 * @return {void}
 */
function createTableFromJSON(leads) {
  const tableContainer = document.getElementById("table-container");
  tableContainer.innerHTML = "";

  const table = document.createElement("table");
  table.setAttribute("border", "1");
  const tableBody = document.createElement("tbody");

  const headerRow = document.createElement("tr");
  const headers = [
    "ID",
    "Название",
    "Цена",
    "Ответственный",
    "Статус",
    "Pipeline ID",
    "Создано",
    "Обновлено",
  ];
  headers.forEach((headerText) => {
    const headerCell = document.createElement("th");
    headerCell.textContent = headerText;
    headerRow.appendChild(headerCell);
    if (["Название", "Цена"].includes(headerText)) {
      headerCell.style.cursor = "pointer";
      headerCell.addEventListener("click", () => {
        sortLeadsByType(headerText);
      });
    }
  });
  tableBody.appendChild(headerRow);

  leads.forEach((lead) => {
    const row = document.createElement("tr");
    const rowData = [
      lead.id,
      lead.name,
      lead.price,
      lead.responsible_user_id,
      lead.status_id,
      lead.pipeline_id,
      new Date(lead.created_at * 1000).toLocaleString(),
      new Date(lead.updated_at * 1000).toLocaleString(),
    ];
    rowData.forEach((data) => {
      const cell = document.createElement("td");
      cell.textContent = data;
      row.appendChild(cell);
    });
    tableBody.appendChild(row);
  });

  table.appendChild(tableBody);
  tableContainer.appendChild(table);
}

/**
 * Сортирует сделки на основе заданного типа сортировки.
 *
 * @param {string} sortType - Тип сортировки, которую необходимо выполнить ("Название" или "Цена").
 * @return {undefined}
 */

function sortLeadsByType(sortType) {
  const sortMethod = sortType === "Название" ? sortByName : sortByPrice;
  const sortedLeads = mainLeads.toSorted(sortMethod);

  if (compareArrays(sortedLeads, mainLeads)) {
    console.log("Already sorted");
    const reversedLeads = sortedLeads.toReversed();
    mainLeads = reversedLeads;
    createTableFromJSON(reversedLeads);

    return;
  }

  createTableFromJSON(sortedLeads);
  mainLeads = sortedLeads;
}

/**
 * Сортирует заданные объекты по их свойствам имени.
 *
 * @param {Object} a - Первый объект для сравнения
 * @param {Object} b - второй объект для сравнения
 * @return {number} Возвращает -1, если a находится перед b, 1, если a находится после b, и 0, если они равны
 */
function sortByName(a, b) {
  if (a.name < b.name) {
    return -1;
  } else if (a.name > b.name) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * Сортирует заданные объекты по цене.
 *
 * @param {Object} a - Первый объект для сравнения
 * @param {Object} b - Второй объект для сравнения
 * @return {number} - Возвращает -1, если цена a меньше цены b, 1, если цена a больше цены b, и 0, если они равны
 */
function sortByPrice(a, b) {
  if (a.price < b.price) {
    return -1;
  } else if (a.price > b.price) {
    return 1;
  } else {
    return 0;
  }
}

/**
 * Сравнивает два массива, преобразуя их в строки и проверяя, равны ли они.
 *
 * @param {Array} a - первый сравниваемый массив
 * @param {Array} b - второй сравниваемый массив
 * @return {boolean} True, если массивы равны, false в противном случае
 */
function compareArrays(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}
