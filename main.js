const CLIENT_ID = "3c0d2422-e6d8-43c4-90e8-431f6cdd4a33";
const SECRET_KEY =
  "cfH4RzKVSqou9Hyvsam3xUM1g9RSC13DTiN4nDTejWOnkI4bthso8EBxMJYLmiWS";

let access_token;
let refresh_token;
let responseData;

function auth() {
  window.open(
    `https://www.amocrm.ru/oauth?client_id=${CLIENT_ID}&state=${123}&mode=post_message`,
    "Предоставить доступ",
    "scrollbars, status, resizable, width=750, height=580",
  );
}

// ===============
const button = document.getElementById("app");

button.addEventListener("click", () => {
  auth();
});

const currentUrl = new URL(window.location.href);
const code = currentUrl.searchParams.get("code");

const userBaseUrl = "https://ilyaprikhodko22.amocrm.ru";
const authUrl = `${userBaseUrl}/oauth2/access_token`;
const leadsUrl = `${userBaseUrl}/api/v4/leads`;

getTokens();

async function getTokens() {
  if (!code) {
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

  access_token = json.access_token;
  refresh_token = json.refresh_token;

  await getLeads();
}

async function getLeads() {
  if (!access_token) {
    return;
  }

  const response = await fetch(leadsUrl, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });

  const json = await response.json();
  responseData = json;

  createTableFromJSON();
}

function createTableFromJSON() {
  if (
    !responseData &&
    !responseData?._embedded?.leads &&
    responseData?._embedded?.leads?.length === 0
  ) {
    document.getElementById("table-container").innerText = "Данных нет";
  }

  const leads = responseData._embedded.leads; // Получаем массив leads

  // Создаем таблицу и тело таблицы
  const table = document.createElement("table");
  table.setAttribute("border", "1"); // Добавляем рамку таблицы для визуализации
  const tableBody = document.createElement("tbody");

  // Создаем шапку таблицы
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
  });
  tableBody.appendChild(headerRow);

  // Наполняем таблицу строками
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

  // Добавляем тело таблицы в таблицу и таблицу в контейнер
  table.appendChild(tableBody);
  document.getElementById("table-container").appendChild(table);
}
