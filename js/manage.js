$(function () {
    var user = APP.getUser();
    if (!user) { window.location.href = 'index.html'; return; }

    $('#logout-btn').on('click', function () { APP.logout(); });

    var selectedSize = null;
    var stationId = null;
    var SIZES = ['SMALL', 'MEDIUM', 'LARGE'];

    function showError(text) { $('#reserve-msg').text(text).removeClass('hidden'); }
    function clearError() { $('#reserve-msg').addClass('hidden').text(''); }
    function titleCase(s) { return s.charAt(0) + s.slice(1).toLowerCase(); }

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

    function refreshReserveState() {
        var ready = selectedSize && $.trim($('#carrier').val()) && stationId;
        $('#reserve-btn').prop('disabled', !ready);
    }

    $('#size-grid').on('click', '.size-card', function () {
        $('.size-card').removeClass('active');
        $(this).addClass('active');
        selectedSize = $(this).data('size');
        clearError();
        refreshReserveState();
    });

    $('#carrier').on('input', refreshReserveState);

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

    loadStations();
});
