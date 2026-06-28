$(function () {
    $('#role-seg').on('click', 'button', function () {
        $('#role-seg button').removeClass('active');
        $(this).addClass('active');
    });

    function showError(text) {
        $('#login-msg').text(text).removeClass('hidden');
    }

    $('#login-form').on('submit', function (e) {
        e.preventDefault();
        var email = $.trim($('#email').val());
        var password = $('#password').val();

        if (!email || !password) {
            showError('Please enter your email and password.');
            return;
        }

        $('#login-btn').prop('disabled', true).text('Signing in…');
        APP.api('POST', '/api/auth/login', { email: email, password: password })
            .done(function (user) {
                if (user.role !== 'RESIDENT' && user.role !== 'PROPERTY_MANAGER') {
                    showError('This account must sign in at the locker machine.');
                    $('#login-btn').prop('disabled', false).text('Log In');
                    return;
                }
                APP.setUser(user);
                window.location.href = 'home.html';
            })
            .fail(function (msg) {
                showError(msg || 'Invalid email or password.');
                $('#login-btn').prop('disabled', false).text('Log In');
            });
    });
});
