$(function () {
    var Keyboard = window.SimpleKeyboard.default;
    var activeField = null;

    var layout = {
        default: [
            '1 2 3 4 5 6 7 8 9 0',
            'q w e r t y u i o p',
            'a s d f g h j k l',
            '{shift} z x c v b n m {bksp}',
            '@ . _ - {space}'
        ],
        shift: [
            '1 2 3 4 5 6 7 8 9 0',
            'Q W E R T Y U I O P',
            'A S D F G H J K L',
            '{shift} Z X C V B N M {bksp}',
            '@ . _ - {space}'
        ]
    };

    var keyboard = new Keyboard({
        layout: layout,
        display: { '{bksp}': '⌫', '{shift}': '⇧', '{space}': 'space' },
        onChange: function (input) {
            if (activeField) { $(activeField).val(input); }
        },
        onKeyPress: function (button) {
            if (button === '{shift}') {
                var current = keyboard.options.layoutName;
                keyboard.setOptions({ layoutName: current === 'default' ? 'shift' : 'default' });
            }
        }
    });

    $('.form-control').on('focus', function () {
        activeField = this;
        keyboard.setOptions({ inputName: this.id });
        keyboard.setInput(this.value, this.id);
    });

    $('.form-control').on('input', function () {
        if (activeField === this) {
            keyboard.setInput(this.value, this.id);
        }
    });

    function showError(text) {
        $('#login-msg').text(text).removeClass('hidden');
    }

    $('#login-form').on('submit', function (e) {
        e.preventDefault();
        var email = $.trim($('#email').val());
        var password = $('#password').val();

        if (!email || !password) {
            showError('Please enter your username and password.');
            return;
        }

        $('#login-btn').prop('disabled', true).text('Signing in…');
        APP.api('POST', '/api/auth/login', { email: email, password: password })
            .done(function (user) {
                if (!APP.isStaff(user.role)) {
                    showError('This account must sign in on the web portal.');
                    $('#login-btn').prop('disabled', false).text('Log In');
                    return;
                }
                APP.setUser(user);
                window.location.href = 'delivery-home.html';
            })
            .fail(function (msg) {
                showError(msg || 'Invalid username or password.');
                $('#login-btn').prop('disabled', false).text('Log In');
            });
    });

    $('#email').trigger('focus');
});
