const CLIENT_ID = '3c0d2422-e6d8-43c4-90e8-431f6cdd4a33';
const SECRET_KEY =
  'cfH4RzKVSqou9Hyvsam3xUM1g9RSC13DTiN4nDTejWOnkI4bthso8EBxMJYLmiWS';

let access_token;
let refresh_token;

function auth() {
  window.open(
    `https://www.amocrm.ru/oauth?client_id=${CLIENT_ID}&state=${123}&mode=post_message`,
    'Предоставить доступ',
    'scrollbars, status, resizable, width=750, height=580'
  );
}

// ===============

const currentUrl = new URL(window.location.href);
const code = currentUrl.searchParams.get('code');

const userBaseUrl = 'https://ilyaprikhodko22.amocrm.ru';
const authUrl = `${userBaseUrl}/oauth2/access_token`;
const leadsUrl = `${userBaseUrl}/api/v4/leads`;

async function getTokens() {
  if (!code) {
    auth();
    return;
  }

  const response = await fetch(authUrl, {
    method: 'POST',
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: SECRET_KEY,
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://acmocrm-test.vercel.app',
    }),
    headers: {
      'Content-Type': 'application/json',
      Host: 'ilyaprikhodko22.amocrm.ru',
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
    method: 'GET',
    headers: {
      Authorization: 'Bearer ' + access_token,
    },
  });

  const json = await response.json();
  console.log(json);
}

getTokens();
