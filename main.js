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

// ===============

const button = document.getElementById("auth");

button.addEventListener("click", () => {
  auth();
});

function auth() {
  window.open(
    `https://www.amocrm.ru/oauth?client_id=${CLIENT_ID}&state=${123}&mode=post_message`,
    "Предоставить доступ",
    "scrollbars, status, resizable, width=750, height=580",
  );
}

// ===============

init();

async function init() {
  const tokensData = await getTokens();

  if (!tokensData) {
    return;
  }

  access_token = tokensData.access_token;
  refresh_token = tokensData.refresh_token;

  const leads = await getLeads();
  const leadsTitle = document.getElementById("title");

  leadsTitle.style.display = "block";
  button.style.display = "none";

  createTableFromJSON(leads);
  mainLeads = leads;
}

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

async function getLeads() {
  if (!access_token) {
    console.error("Error! Something went wrong!");
    return;
  }

  const response = await fetch(leadsUrl, {
    method: "GET",
    headers: {
      Authorization: "Bearer " + access_token,
    },
  });

  const json = await response.json();

  return json?._embedded?.leads;
}

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

function sortLeadsByType(sortType) {
  const sortMethod = sortType === "Название" ? sortByName : sortByPrice;
  const sortedLeads = mainLeads.toSorted(sortMethod);

  if (sortedLeads === mainLeads) {
    console.log("ravno");
    const reversedLeads = sortedLeads.toReversed();
    mainLeads = reversedLeads;
    createTableFromJSON(reversedLeads);

    return;
  }

  createTableFromJSON(sortedLeads);
  mainLeads = sortedLeads;
  // =========

  // if (sortType === "Название") {
  //   const newLeads = mainLeads.toSorted(sortByName);

  //   if (newLeads === mainLeads) {
  //     mainLeads = newLeads.toReversed();
  //     createTableFromJSON(newLeads);

  //     return;
  //   }

  //   createTableFromJSON(newLeads);
  //   mainLeads = newLeads;
  // }

  // if (sortType === "Цена") {
  //   const newLeads = mainLeads.toSorted(sortByPrice);

  //   if (newLeads === mainLeads) {
  //     mainLeads = newLeads.toReversed();
  //     createTableFromJSON(newLeads);

  //     return;
  //   }

  //   createTableFromJSON(newLeads);
  //   mainLeads = newLeads;
  // }
}

function sortByName(a, b) {
  if (a.name < b.name) {
    return -1;
  } else if (a.name > b.name) {
    return 1;
  } else {
    return 0;
  }
}

function sortByPrice(a, b) {
  if (a.price < b.price) {
    return -1;
  } else if (a.price > b.price) {
    return 1;
  } else {
    return 0;
  }
}
