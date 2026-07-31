$(function () {
    var user = APP.requireRole('RESIDENT');
    if (!user) { return; }

    // Log out on button click
    $('#logout-btn').on('click', function () { APP.logout(); });

    // Capitalize first letter, lowercase the rest
    function titleCase(s) { return s.charAt(0) + s.slice(1).toLowerCase(); }

    // Format ISO date as a readable deadline
    function formatDeadline(iso) {
        var d = new Date(iso);
        var date = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
        var time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
        return date + ', ' + time;
    }

    // Load this resident's parcels awaiting collection
    APP.api('GET', '/api/parcels/mine?email=' + encodeURIComponent(user.email))
        .done(function (parcels) {
            var $list = $('#parcel-list').empty();
            if (!parcels || parcels.length === 0) {
                $list.append('<p class="text-muted">No parcels waiting for collection.</p>');
                return;
            }
            parcels.forEach(function (p) {
                var $main = $('<div class="parcel-main">');
                $main.append($('<div class="parcel-title">').text(p.carrier + ' · ' + titleCase(p.size) + ' box'));
                if (p.orderNumber) {
                    $main.append($('<div class="parcel-sub">').text('Order ' + p.orderNumber));
                }
                $main.append($('<div class="parcel-sub">').text(
                    'Locker ' + p.lockerCode + ' · Code ' + p.collectionCode + ' · Expires ' + formatDeadline(p.deadline)
                ));

                var $row = $('<div class="parcel-row">');
                $row.append('<div class="parcel-ico">📦</div>');
                $row.append($main);
                $row.append('<span class="pill-ready">Ready</span>');
                $list.append($row);
            });
        })
        .fail(function (msg) {
            $('#parcel-msg').text(msg).removeClass('hidden');
        });
});
