$(function () {
    var user = APP.getUser();
    if (!user || !APP.isStaff(user.role)) {
        window.location.href = 'machine-login.html';
        return;
    }

    var selectedSize = null;
    var openedParcelId = null;
    var SIZES = ['SMALL', 'MEDIUM', 'LARGE'];

    function showError(text) {
        $('#store-msg').text(text).removeClass('hidden');
    }
    function clearError() {
        $('#store-msg').addClass('hidden').text('');
    }

    function currentStationId() {
        return $('#station-select').val();
    }

    function loadStations() {
        APP.api('GET', '/api/stations')
            .done(function (stations) {
                if (!stations || stations.length === 0) {
                    showError('No locker stations exist yet. Please create one first.');
                    $('#station-select').hide();
                    return;
                }
                var $sel = $('#station-select').empty();
                stations.forEach(function (s) {
                    $sel.append($('<option>').val(s.id).text(s.name + ' (' + s.code + ')'));
                });
                loadAvailability();
            })
            .fail(function (msg) { showError(msg); });
    }

    function loadAvailability() {
        var stationId = currentStationId();
        if (!stationId) { return; }
        APP.api('GET', '/api/stations/' + stationId + '/lockers/available')
            .done(function (lockers) {
                var counts = { SMALL: 0, MEDIUM: 0, LARGE: 0 };
                (lockers || []).forEach(function (l) {
                    if (counts[l.size] !== undefined) { counts[l.size]++; }
                });
                SIZES.forEach(function (size) {
                    var n = counts[size];
                    $('[data-free="' + size + '"]').text(n + (n === 1 ? ' free locker' : ' free lockers'));
                    $('.size-card[data-size="' + size + '"]').toggleClass('soldout', n === 0);
                });
            })
            .fail(function (msg) { showError(msg); });
    }

    function refreshAssignState() {
        var ready = selectedSize && $.trim($('#recipient').val()) && $.trim($('#carrier').val()) && $.trim($('#order-number').val()) && currentStationId();
        $('#assign-btn').prop('disabled', !ready);
    }

    $('#station-select').on('change', function () {
        clearError();
        loadAvailability();
        refreshAssignState();
    });

    $('#size-grid').on('click', '.size-card', function () {
        $('.size-card').removeClass('active');
        $(this).addClass('active');
        selectedSize = $(this).data('size');
        clearError();
        refreshAssignState();
    });

    $('#recipient').on('input', refreshAssignState);
    $('#carrier').on('input', refreshAssignState);
    $('#order-number').on('input', refreshAssignState);

    $('#assign-btn').on('click', function () {
        clearError();
        var recipient = $.trim($('#recipient').val());
        var carrier = $.trim($('#carrier').val());
        var orderNumber = $.trim($('#order-number').val());
        if (!recipient || !carrier || !orderNumber || !selectedSize) { return; }

        $('#assign-btn').prop('disabled', true).text('Opening locker…');
        APP.api('POST', '/api/parcels/open', {
            stationId: Number(currentStationId()),
            recipientEmail: recipient,
            size: selectedSize,
            carrier: carrier,
            orderNumber: orderNumber
        })
            .done(function (res) {
                openedParcelId = res.parcelId;
                $('#locker-code').text(res.lockerCode);
                $('#opened-size').text(titleCase(selectedSize));
                $('#opened-recipient').text(recipient);
                $('#opened-order').text(orderNumber);
                $('#size-view').addClass('hidden');
                $('#opened-view').removeClass('hidden');
                $('#kb-panel').addClass('hidden');
            })
            .fail(function (msg) {
                showError(msg);
                $('#assign-btn').prop('disabled', false).text('Assign Locker');
            });
    });

    $('#done-btn').on('click', function () {
        if (!openedParcelId) { return; }
        $('#done-btn').prop('disabled', true).text('Saving…');
        APP.api('POST', '/api/parcels/' + openedParcelId + '/close')
            .done(function () { resetToStart(); })
            .fail(function (msg) {
                $('#done-btn').prop('disabled', false).text('Done');
                alert(msg);
            });
    });

    function resetToStart() {
        openedParcelId = null;
        selectedSize = null;
        $('#recipient').val('');
        $('#carrier').val('');
        $('#order-number').val('');
        $('.size-card').removeClass('active');
        $('#done-btn').prop('disabled', false).text('Done');
        $('#assign-btn').text('Assign Locker');
        $('#opened-view').addClass('hidden');
        $('#size-view').removeClass('hidden');
        $('#kb-panel').removeClass('hidden');
        refreshAssignState();
        loadAvailability();
    }

    function titleCase(s) {
        return s.charAt(0) + s.slice(1).toLowerCase();
    }

    $('#logout-btn').on('click', function () {
        APP.logout('resident-home.html');
    });

    var Keyboard = window.SimpleKeyboard.default;
    var activeField = null;
    var kbLayout = {
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
        layout: kbLayout,
        display: { '{bksp}': '⌫', '{shift}': '⇧', '{space}': 'space' },
        onChange: function (input) {
            if (activeField) { $(activeField).val(input).trigger('input'); }
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

    loadStations();
});
