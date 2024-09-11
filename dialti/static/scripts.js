$(document).ready(function() {
    var token = localStorage.getItem('token');
    if (!token) {
        toggleAuthButtons(false);
        alert('Будь ласка, увійдіть у систему.');
    } else {
        var tokenParts = token.split('.');
        var payload = JSON.parse(atob(tokenParts[1]));
        var exp = payload.exp;
        var now = Date.now() / 1000;
        if (exp < now) {
            getNewToken();
        } else {
            loadProducts();
            displayTokenInfo();
            toggleAuthButtons(true);
        }
    }

    $('#login-button').on('click', function() {
        const username = prompt('Введіть ваше ім\'я користувача:');
        const password = prompt('Введіть ваш пароль:');

        $.ajax({
            url: '/api/v1/token/',
            type: 'POST',
            data: JSON.stringify({ 'username': username, 'password': password }),
            contentType: 'application/json',
            success: function(response) {
                localStorage.setItem('token', response.access);
                localStorage.setItem('refreshToken', response.refresh);
                displayTokenInfo();
                loadProducts();
                toggleAuthButtons(true);
            },
            error: function(xhr, status, error) {
                console.error('Помилка при вході:', status, error);
            }
        });
    });

    $('#logout-button').on('click', function() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        $('#product-list').empty();
        $('#access-token').text('');
        $('#refresh-token').text('');
        toggleAuthButtons(false);
        alert('Ви успішно вийшли з системи.');
    });

    $('#add-product-button').on('click', addProduct);
    $('#update-product-button').on('click', updateProduct);
    $('#delete-product-button').on('click', deleteProduct);
});

// Функція для завантаження продуктів з API
function loadProducts() {
    var token = localStorage.getItem('token');
    if (token) {
        $.ajax({
            url: '/api/v1/product/',
            type: 'GET',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                $('#product-list').empty();
                response.forEach(function(product) {
                    $('#product-list').append('<li>' + product.name + ' - ' + product.price + '</li>');
                });
            },
            error: function(xhr, status, error) {
                console.error('Сталася помилка при завантаженні продуктів:', status, error);
            }
        });
    } else {
        alert('Ви не авторизовані');
    }
}

// Функція для отримання нового JWT токена
function getNewToken() {
    $.ajax({
        url: '/api/v1/token/refresh/',
        type: 'POST',
        data: JSON.stringify({
            'refresh': localStorage.getItem('refreshToken')
        }),
        contentType: 'application/json',
        success: function(response) {
            localStorage.setItem('token', response.access);
            loadProducts();
            displayTokenInfo();
        },
        error: function(xhr, status, error) {
            console.error('Помилка при оновленні токена:', status, error);
        }
    });
}

// Функція для додавання продукту
function addProduct() {
    var token = localStorage.getItem('token');
    if (token) {
        const name = prompt('Введіть назву продукту:');
        const price = prompt('Введіть ціну продукту:');

        $.ajax({
            url: '/api/v1/product/',
            type: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            contentType: 'application/json',
            data: JSON.stringify({
                'name': name,
                'price': price
            }),
            success: function(response) {
                alert('Продукт додано успішно!');
                loadProducts();
            },
            error: function(xhr, status, error) {
                console.error('Сталася помилка при додаванні продукту:', status, error);
                console.log('Response text:', xhr.responseText);
            }
        });
    } else {
        alert('Ви не авторизовані');
    }
}

// Функція для оновлення продукту
function updateProduct() {
    var token = localStorage.getItem('token');
    if (token) {
        const productId = prompt('Введіть ID продукту, який хочете оновити:');
        const name = prompt('Введіть нову назву продукту:');
        const price = prompt('Введіть нову ціну продукту:');

        $.ajax({
            url: '/api/v1/product/' + productId + '/',
            type: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            contentType: 'application/json',
            data: JSON.stringify({
                'name': name,
                'price': price
            }),
            success: function(response) {
                alert('Продукт оновлено успішно!');
                loadProducts();
            },
            error: function(xhr, status, error) {
                console.error('Сталася помилка при оновленні продукту:', status, error);
            }
        });
    } else {
        alert('Ви не авторизовані');
    }
}

// Функція для видалення продукту
function deleteProduct() {
    var token = localStorage.getItem('token');
    if (token) {
        const productId = prompt('Введіть ID продукту, який хочете видалити:');

        $.ajax({
            url: '/api/v1/product/' + productId + '/',
            type: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            success: function(response) {
                alert('Продукт видалено успішно!');
                loadProducts();
            },
            error: function(xhr, status, error) {
                console.error('Сталася помилка при видаленні продукту:', status, error);
            }
        });
    } else {
        alert('Ви не авторизовані');
    }
}

// Функція для відображення інформації про токени
function displayTokenInfo() {
    $('#access-token').text(localStorage.getItem('token'));
    $('#refresh-token').text(localStorage.getItem('refreshToken'));
}

// Функція для активації/деактивації кнопок аутентифікації
function toggleAuthButtons(isLoggedIn) {
    $('#login-button').prop('disabled', isLoggedIn);
    $('#logout-button').prop('disabled', !isLoggedIn);
}
