$(function () {
    var user = APP.requireRole('DELIVERY_STAFF');
    if (!user) { return; }

    $('#logout-btn').on('click', function () { APP.logout(); });

    function titleCase(s) { return s.charAt(0) + s.slice(1).toLowerCase(); }

    APP.api('GET', '/api/parcels/assigned?email=' + encodeURIComponent(user.email))
        .done(function (parcels) {
            var $list = $('#parcel-list').empty();
            if (!parcels || parcels.length === 0) {
                $list.append('<p class="text-muted">No parcels to pick up.</p>');
                return;
            }
            parcels.forEach(function (p) {
                var $main = $('<div class="parcel-main">');
                $main.append($('<div class="parcel-title">').text(p.carrier + ' · ' + titleCase(p.size) + ' box'));
                $main.append($('<div class="parcel-sub">').text('Locker ' + p.lockerCode + ' · ' + p.stationName));

                var $row = $('<div class="parcel-row">');
                $row.append('<div class="parcel-ico">📦</div>');
                $row.append($main);
                $row.append('<span class="pill-ready">To pick up</span>');
                $list.append($row);
            });
        })
        .fail(function (msg) {
            $('#parcel-msg').text(msg).removeClass('hidden');
        });
});
