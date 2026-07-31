// Wire up a 6-digit keypad and report entered codes
function setupKeypad(displaySel, onSubmit) {
    var code = '';

    // Show the current code with placeholder underscores
    function render() {
        $(displaySel).text(code + '______'.slice(code.length));
    }
    render();

    // Handle digit, delete, and OK button presses
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
