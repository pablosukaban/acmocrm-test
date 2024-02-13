var popup;

const CLIENT_ID = "3c0d2422-e6d8-43c4-90e8-431f6cdd4a33"
const SECRET_KEY = "cfH4RzKVSqou9Hyvsam3xUM1g9RSC13DTiN4nDTejWOnkI4bthso8EBxMJYLmiWS"
const dolgosrochniy = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImNjMzJlOWY2ZWI5NGE1NWY5ODcwMzM0ZmQ3MTg0Yjc1OWJmZjhiZmMzMTFmOTgyY2M5NTA0MjliOTA5NDllOGVmZGE4YTEyZDE3NDM4NWRlIn0.eyJhdWQiOiIzYzBkMjQyMi1lNmQ4LTQzYzQtOTBlOC00MzFmNmNkZDRhMzMiLCJqdGkiOiJjYzMyZTlmNmViOTRhNTVmOTg3MDMzNGZkNzE4NGI3NTliZmY4YmZjMzExZjk4MmNjOTUwNDI5YjkwOTQ5ZThlZmRhOGExMmQxNzQzODVkZSIsImlhdCI6MTcwNzgzNTg1MSwibmJmIjoxNzA3ODM1ODUxLCJleHAiOjE3MTgyMzY4MDAsInN1YiI6IjEwNjY4NjA2IiwiZ3JhbnRfdHlwZSI6IiIsImFjY291bnRfaWQiOjMxNTY2MTkwLCJiYXNlX2RvbWFpbiI6ImFtb2NybS5ydSIsInZlcnNpb24iOjIsInNjb3BlcyI6WyJjcm0iLCJmaWxlcyIsImZpbGVzX2RlbGV0ZSIsIm5vdGlmaWNhdGlvbnMiLCJwdXNoX25vdGlmaWNhdGlvbnMiXSwiaGFzaF91dWlkIjoiMjM1YmUwNjctMjk2OS00ZGIwLThjOWQtMDVkNDI5OTNhYWQxIn0.r5dFFLIw4s6o3ga3gKgtRv6bn5Cnl8BGyFeFZHRqyNMcvjajRgP6wPxDnF9h7tnSjgFVIsjAJkZUMVyEAFFcdr3cOGvsSO6_WiPjjSCVxJ61XxpIx5FZUekZBaLJEfVCg3bCq6oqNH3Akj5l_klPzvAaEamrNYySo7IoT8KGC3utd_3GlRZt_yinrdtr4W9fo3YzSpfqGAmx9PuVG3UGmg6Kw1wmEPVo4PfbnWPQbZs_92doNvWMuJKwVJgcZ-0rEKFro_X4IKw98RahANLT5yGb0TVn_JKKZ8Rp0_yMsLh-SXwAjzPL9SLTHxaFze2UBlif8BgkM8tH6Gf-OiZnnQ'

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

const a = 'https://ilyaprikhodko22.amocrm.ru/oauth2/access_token';

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
      "Host": 'ilyaprikhodko22.amocrm.ru'
    },
  });

  const json = await response.json();

  console.log(json);
}

getTokens();