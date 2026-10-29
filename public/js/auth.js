async function registerUser(event) {
    event.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const email = document.getElementById('reg-email').value.trim();
    const password = document.getElementById('reg-password').value;
    const password2 = document.getElementById('reg-password2').value;

    if (password !== password2) {
        alert('Пароли не совпадают');
        return;
    }

    if (password.length < 6) {
        alert('Пароль должен быть не меньше 6 символов');
        return;
    }

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Ошибка регистрации');
            return;
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'account.html';
    } catch (error) {
        console.error(error);
        alert('Ошибка регистрации');
    }
}

async function loginUser(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.error || 'Ошибка входа');
            return;
        }

        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = 'account.html';
    } catch (error) {
        console.error(error);
        alert('Ошибка входа');
    }
}

// Функция обновления шапки
function updateHeader() {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    const loginLink = document.querySelector('.login-link');
    
    if (loginLink && user) {
        loginLink.textContent = user.user_name;
        loginLink.href = 'account.html';
    }
}

// Запускаем проверку сразу после загрузки страницы
document.addEventListener('DOMContentLoaded', updateHeader);