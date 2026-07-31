$(function () {
    var user = APP.getUser();
    if (!user || !APP.isStaff(user.role)) {
        window.location.href = 'machine-login.html';
        return;
    }

    var openedParcelId = null;

    function showError(text) { $('#pickup-msg').text(text).removeClass('hidden'); }
    function clearError() { $('#pickup-msg').addClass('hidden').text(''); }
    function titleCase(s) { return s.charAt(0) + s.slice(1).toLowerCase(); }

    // Load parcels assigned to this staff member
    function loadList() {
        clearError();
        APP.api('GET', '/api/parcels/assigned?email=' + encodeURIComponent(user.email))
            .done(function (parcels) {
                var $list = $('#pickup-list').empty();
                if (!parcels || parcels.length === 0) {
                    $list.append('<p class="text-muted text-center">No parcels to collect.</p>');
                    return;
                }
                parcels.forEach(function (p) {
                    var $main = $('<div class="parcel-main">');
                    $main.append($('<div class="parcel-title">').text('Locker ' + p.lockerCode + ' · ' + titleCase(p.size)));
                    $main.append($('<div class="parcel-sub">').text(p.carrier + ' · ' + p.stationName));

                    var $btn = $('<button class="btn btn-primary btn-sm">').text('Open');
                    $btn.on('click', function () { openLocker(p.parcelId); });

                    var $row = $('<div class="parcel-row">');
                    $row.append('<div class="parcel-ico">📦</div>');
                    $row.append($main);
                    $row.append($btn);
                    $list.append($row);
                });
            })
            .fail(function (msg) { showError(msg); });
    }

    // Open the locker for the selected parcel
    function openLocker(parcelId) {
        clearError();
        APP.api('POST', '/api/parcels/' + parcelId + '/pickup/open')
            .done(function (res) {
                openedParcelId = res.parcelId;
                $('#opened-locker').text(res.lockerCode);
                $('#list-view').addClass('hidden');
                $('#opened-view').removeClass('hidden');
            })
            .fail(function (msg) { showError(msg); });
    }

    // Mark pickup complete and refresh the list
    $('#done-btn').on('click', function () {
        if (!openedParcelId) { return; }
        $('#done-btn').prop('disabled', true).text('Saving…');
        APP.api('POST', '/api/parcels/' + openedParcelId + '/pickup/done')
            .done(function () {
                openedParcelId = null;
                $('#done-btn').prop('disabled', false).text('Done');
                $('#opened-view').addClass('hidden');
                $('#list-view').removeClass('hidden');
                loadList();
            })
            .fail(function (msg) {
                $('#done-btn').prop('disabled', false).text('Done');
                alert(msg);
            });
    });

    loadList();
});
