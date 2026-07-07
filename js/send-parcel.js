$(function () {
    var stationId = null;
    var openedParcelId = null;
    var pad;

    function showError(text) { $('#send-msg').text(text).removeClass('hidden'); }
    function clearError() { $('#send-msg').addClass('hidden').text(''); }

    APP.api('GET', '/api/stations').done(function (stations) {
        if (stations && stations.length) { stationId = stations[0].id; }
    });

    pad = setupKeypad('#code-display', function (code) {
        if (!stationId) { showError('No locker station available.'); return; }
        clearError();
        APP.api('POST', '/api/parcels/reserve/open', { collectionCode: code, stationId: Number(stationId) })
            .done(function (res) {
                openedParcelId = res.parcelId;
                $('#opened-locker').text(res.lockerCode);
                $('#code-view').addClass('hidden');
                $('#opened-view').removeClass('hidden');
            })
            .fail(function (msg) {
                showError(msg);
                pad.reset();
            });
    });

    $('#done-btn').on('click', function () {
        if (!openedParcelId) { return; }
        $('#done-btn').prop('disabled', true).text('Saving…');
        APP.api('POST', '/api/parcels/' + openedParcelId + '/reserve/done')
            .done(function () { window.location.href = 'resident-home.html'; })
            .fail(function (msg) {
                $('#done-btn').prop('disabled', false).text('Done');
                alert(msg);
            });
    });
});
