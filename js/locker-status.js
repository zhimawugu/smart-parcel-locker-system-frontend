$(function () {
    var user = APP.requireRole('PROPERTY_MANAGER');
    if (!user) { return; }

    $('#logout-btn').on('click', function () { APP.logout(); });

    var STATUSES = [
        { key: 'OCCUPIED', label: 'Occupied', cls: 'lk-occupied' },
        { key: 'AVAILABLE', label: 'Available', cls: 'lk-available' },
        { key: 'RESERVED', label: 'Reserved', cls: 'lk-reserved' },
        { key: 'OUT_OF_SERVICE', label: 'Out of service', cls: 'lk-oos' }
    ];

    function bucket(status) {
        return status === 'DOOR_OPEN' ? 'OCCUPIED' : status;
    }
    // Get label and CSS class for a status
    function meta(status) {
        var b = bucket(status);
        return STATUSES.filter(function (s) { return s.key === b; })[0] || { label: status, cls: '' };
    }
    function showError(msg) { $('#lk-msg').text(msg).removeClass('hidden'); }

    // Load the first station then its lockers
    APP.api('GET', '/api/stations')
        .done(function (stations) {
            if (!stations || stations.length === 0) { showError('No locker stations available.'); return; }
            var station = stations[0];
            $('#subtitle').text('Live overview of all lockers in ' + station.name);
            loadLockers(station.id);
        })
        .fail(showError);

    // Fetch lockers for a station and render them
    function loadLockers(stationId) {
        APP.api('GET', '/api/stations/' + stationId + '/lockers')
            .done(function (lockers) {
                lockers = lockers || [];
                renderStats(lockers);
                renderGrid(lockers);
            })
            .fail(showError);
    }

    // Build a single stat tile element
    function statTile(label, value, cls) {
        return $('<div class="col">').append(
            $('<div class="lk-stat ' + cls + '">')
                .append($('<div class="lk-stat-num">').text(value))
                .append($('<div class="lk-stat-label">').text(label))
        );
    }

    // Count lockers by status and render stat tiles
    function renderStats(lockers) {
        var counts = { OCCUPIED: 0, AVAILABLE: 0, RESERVED: 0, OUT_OF_SERVICE: 0 };
        lockers.forEach(function (l) {
            var b = bucket(l.status);
            if (counts[b] !== undefined) { counts[b]++; }
        });
        var $row = $('#stat-row').empty();
        $row.append(statTile('Total', lockers.length, ''));
        STATUSES.forEach(function (s) { $row.append(statTile(s.label, counts[s.key], s.cls)); });
    }

    // Render the grid of locker status cards
    function renderGrid(lockers) {
        var $grid = $('#locker-grid').empty();
        lockers.forEach(function (l) {
            var m = meta(l.status);
            $grid.append(
                $('<div class="lk-card ' + m.cls + '">')
                    .append($('<i class="lk-dot ' + m.cls + '">'))
                    .append($('<div class="lk-code">').text(l.code))
                    .append($('<div class="lk-status">').text(m.label))
            );
        });
    }
});
