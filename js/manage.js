$(function () {
    var user = APP.requireRole('RESIDENT');
    if (!user) { return; }

    // log out
    $('#logout-btn').on('click', function () { APP.logout(); });

    var selectedSize = null;
    var stationId = null;
    var SIZES = ['SMALL', 'MEDIUM', 'LARGE'];

    // show an error message
    function showError(text) { $('#reserve-msg').text(text).removeClass('hidden'); }
    // hide the error message
    function clearError() { $('#reserve-msg').addClass('hidden').text(''); }
    // capitalize the first letter only
    function titleCase(s) { return s.charAt(0) + s.slice(1).toLowerCase(); }

    // load the first station and its availability
    function loadStations() {
        APP.api('GET', '/api/stations')
            .done(function (stations) {
                if (!stations || stations.length === 0) {
                    showError('No locker stations available.');
                    return;
                }
                stationId = stations[0].id;
                loadAvailability();
            })
            .fail(function (msg) { showError(msg); });
    }

    // count free lockers per size for the station
    function loadAvailability() {
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

    // enable Reserve button when the form is ready
    function refreshReserveState() {
        var ready = selectedSize && $.trim($('#carrier').val()) && stationId;
        $('#reserve-btn').prop('disabled', !ready);
    }

    // select a locker size
    $('#size-grid').on('click', '.size-card', function () {
        $('.size-card').removeClass('active');
        $(this).addClass('active');
        selectedSize = $(this).data('size');
        clearError();
        refreshReserveState();
    });

    $('#carrier').on('input', refreshReserveState);

    // reserve a locker for the resident
    $('#reserve-btn').on('click', function () {
        clearError();
        var carrier = $.trim($('#carrier').val());
        if (!carrier || !selectedSize) { return; }

        $('#reserve-btn').prop('disabled', true).text('Reserving…');
        APP.api('POST', '/api/parcels/reserve', {
            email: user.email,
            stationId: Number(stationId),
            carrier: carrier,
            size: selectedSize
        })
            .done(function (res) {
                $('#res-code').text(res.reservationCode);
                $('#res-locker').text(res.lockerCode);
                $('#res-size').text(titleCase(res.size));
                $('#reserve-view').addClass('hidden');
                $('#confirmed-view').removeClass('hidden');
            })
            .fail(function (msg) {
                showError(msg);
                $('#reserve-btn').prop('disabled', false).text('Reserve Locker');
            });
    });

    // reset the form after a reservation
    $('#reserve-done-btn').on('click', function () {
        selectedSize = null;
        $('#carrier').val('');
        $('.size-card').removeClass('active');
        $('#reserve-btn').text('Reserve Locker');
        $('#confirmed-view').addClass('hidden');
        $('#reserve-view').removeClass('hidden');
        refreshReserveState();
        loadAvailability();
    });

    var extendDeadlineIso = null;
    var extendDays = null;

    // format a deadline for display
    function formatDeadline(iso) {
        var d = new Date(iso);
        var date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        var time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return date + ', ' + time;
    }
    // days remaining until the deadline
    function daysLeft(iso) {
        return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86400000));
    }
    // build "Expires in N days" text
    function expiresText(iso) {
        var n = daysLeft(iso);
        return 'Expires in ' + n + (n === 1 ? ' day' : ' days');
    }
    // show extend status message
    function showExtendMsg(text, ok) {
        $('#extend-msg').text(text).removeClass('hidden text-danger text-success')
            .addClass(ok ? 'text-success' : 'text-danger');
    }
    // reset the extend deadline section
    function resetExtend() {
        $('#deadline-box').addClass('hidden');
        $('#extend-seg button').removeClass('active');
        $('#new-deadline').text('—');
        $('#extend-btn').prop('disabled', true).text('Extend Deadline');
        extendDeadlineIso = null;
        extendDays = null;
    }

    // look up parcel deadline by collection code
    $('#extend-code').on('input', function () {
        $('#extend-msg').addClass('hidden');
        var code = $.trim($(this).val());
        if (code.length !== 6) { resetExtend(); return; }
        APP.api('GET', '/api/parcels/deadline?collectionCode=' + encodeURIComponent(code))
            .done(function (res) {
                extendDeadlineIso = res.deadline;
                extendDays = null;
                $('#current-deadline').text(formatDeadline(res.deadline));
                $('#expires-pill').text(expiresText(res.deadline));
                $('#extend-seg button').removeClass('active');
                $('#new-deadline').text('—');
                $('#extend-btn').prop('disabled', true).text('Extend Deadline');
                $('#deadline-box').removeClass('hidden');
                if (res.extended) {
                    $('#extend-controls').addClass('hidden');
                    showExtendMsg('This parcel has already been extended once.', false);
                } else {
                    $('#extend-controls').removeClass('hidden');
                }
            })
            .fail(function (msg) { resetExtend(); showExtendMsg(msg, false); });
    });

    // preview the new deadline for the chosen days
    $('#extend-seg').on('click', 'button', function () {
        if (!extendDeadlineIso) { return; }
        $('#extend-seg button').removeClass('active');
        $(this).addClass('active');
        extendDays = Number($(this).data('days'));
        var nd = new Date(extendDeadlineIso);
        nd.setDate(nd.getDate() + extendDays);
        $('#new-deadline').text(formatDeadline(nd.toISOString()));
        $('#extend-btn').prop('disabled', false);
    });

    // submit the deadline extension
    $('#extend-btn').on('click', function () {
        if (!extendDays) { return; }
        var code = $.trim($('#extend-code').val());
        $('#extend-btn').prop('disabled', true).text('Extending…');
        APP.api('POST', '/api/parcels/extend', { collectionCode: code, days: extendDays })
            .done(function (res) {
                extendDeadlineIso = res.deadline;
                $('#current-deadline').text(formatDeadline(res.deadline));
                $('#expires-pill').text(expiresText(res.deadline));
                $('#extend-controls').addClass('hidden');
                showExtendMsg('Deadline extended to ' + formatDeadline(res.deadline) + '.', true);
            })
            .fail(function (msg) {
                showExtendMsg(msg, false);
                $('#extend-btn').prop('disabled', false).text('Extend Deadline');
            });
    });

    loadStations();
});
