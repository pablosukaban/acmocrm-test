const url = new URL(window.location.href);
const code = url.searchParams.get('code');

const CLIENT_ID = '3c0d2422-e6d8-43c4-90e8-431f6cdd4a33';
const SECRET_KEY =
  'cfH4RzKVSqou9Hyvsam3xUM1g9RSC13DTiN4nDTejWOnkI4bthso8EBxMJYLmiWS';

const a = 'https://www.amocrm.ru/oauth2/access_token';

async function getTokens() {
  if (!code) {
    console.log('123')
    return;
  }

  const response = await fetch(a, {
    method: 'POST',
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: SECRET_KEY,
      grant_type: 'authorization_code',
      code,
      redirect_uri: 'https://atusue.ru',
    }),
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const json = await response.json();

  console.log(json);
}

getTokens();
