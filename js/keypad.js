function setupKeypad(displaySel, onSubmit) {
    var code = '';

    function render() {
        $(displaySel).text(code + '______'.slice(code.length));
    }
    render();

    $('#keypad').on('click', 'button', function () {
        var key = String($(this).data('key'));
        if (key === 'del') {
            code = code.slice(0, -1);
        } else if (key === 'ok') {
            if (code.length === 6) { onSubmit(code); }
            return;
        } else if (code.length < 6) {
            code += key;
        }
        render();
    });

    return { reset: function () { code = ''; render(); } };
}
