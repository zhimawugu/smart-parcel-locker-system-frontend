$(function () {
    function show(text, ok) {
        $('#register-msg')
            .removeClass('hidden text-danger text-success')
            .addClass(ok ? 'text-success' : 'text-danger')
            .text(text);
    }

    $('#register-form').on('submit', function (e) {
        e.preventDefault();
        var fullName = $.trim($('#fullName').val());
        var email = $.trim($('#email').val());
        var password = $('#password').val();

        if (!fullName || !email || !password) {
            show('Please fill in all fields.', false);
            return;
        }
        if (password.length < 8 || password.length > 20) {
            show('Password must be 8–20 characters.', false);
            return;
        }

        $('#register-btn').prop('disabled', true).text('Creating…');
        APP.api('POST', '/api/auth/register', {
            fullName: fullName,
            email: email,
            password: password
        })
            .done(function () {
                show('Account created! Redirecting to sign in…', true);
                setTimeout(function () { window.location.href = 'index.html'; }, 1200);
            })
            .fail(function (msg) {
                show(msg || 'Registration failed.', false);
                $('#register-btn').prop('disabled', false).text('Create account');
            });
    });
});
