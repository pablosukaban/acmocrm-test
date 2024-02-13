var popup;

const CLIENT_ID = "3c0d2422-e6d8-43c4-90e8-431f6cdd4a33"
const SECRET_KEY = "cfH4RzKVSqou9Hyvsam3xUM1g9RSC13DTiN4nDTejWOnkI4bthso8EBxMJYLmiWS"

// auth();

// 1. Открывает окно предоставления доступов
function auth() {
  popup = window.open(`https://www.amocrm.ru/oauth?client_id=${CLIENT_ID}&state=${123}&mode=post_message`, 'Предоставить доступ', 'scrollbars, status, resizable, width=750, height=580');
}

// 2. Регистрируем обработчика сообщений из popup окна
window.addEventListener('message', updateAuthInfo);

// 3. Функция обработчик, зарегистрированная выше
function updateAuthInfo(e) {
  if (e.data.error !== undefined) {
    console.log('Ошибка - ' + e.data.error)
  } else {
    console.log('Авторизация прошла')
  }

  // 4. Закрываем модальное окно
  popup.close();
}

// ====

const url = new URL(window.location.href);
const code = url.searchParams.get('code');

const a = 'https://www.amocrm.ru/oauth2/access_token';

async function getTokens() {
  if (!code) {
    auth()
    return;
  }

  const response = await fetch(a, {
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
    },
  });

  const json = await response.json();

  console.log(json);
}

getTokens();