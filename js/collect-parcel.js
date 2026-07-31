$(function () {
    var stationId = null;
    var openedParcelId = null;
    var pad;

    // Show an error message
    function showError(text) { $('#collect-msg').text(text).removeClass('hidden'); }
    // Hide the error message
    function clearError() { $('#collect-msg').addClass('hidden').text(''); }

    // Load the locker station id
    APP.api('GET', '/api/stations').done(function (stations) {
        if (stations && stations.length) { stationId = stations[0].id; }
    });

    // Submit collection code to open the locker
    pad = setupKeypad('#code-display', function (code) {
        if (!stationId) { showError('No locker station available.'); return; }
        clearError();
        APP.api('POST', '/api/parcels/collect', { collectionCode: code, stationId: Number(stationId) })
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

    // Confirm collection and finish
    $('#done-btn').on('click', function () {
        if (!openedParcelId) { return; }
        $('#done-btn').prop('disabled', true).text('Saving…');
        APP.api('POST', '/api/parcels/' + openedParcelId + '/collect/done')
            .done(function () { window.location.href = 'resident-home.html'; })
            .fail(function (msg) {
                $('#done-btn').prop('disabled', false).text('Done');
                alert(msg);
            });
    });
});
