$(function () {
    var user = APP.getUser();
    if (!user) { window.location.href = 'index.html'; return; }

    var roleLabels = {
        RESIDENT: 'Resident',
        DELIVERY_STAFF: 'Delivery Staff',
        LOCKER_STAFF: 'Locker Staff',
        PROPERTY_MANAGER: 'Property Manager'
    };

    $('#hello').text('Hi, ' + (user.fullName || user.email));
    $('#role-badge').text(roleLabels[user.role] || user.role);

    if (APP.isStaff(user.role)) {
        $('#staff-tile').removeClass('hidden');
    }

    if (user.role === 'DELIVERY_STAFF') {
        $('#courier-tile').removeClass('hidden');
    }

    if (user.role === 'PROPERTY_MANAGER') {
        $('#manager-tile').removeClass('hidden');
    }

    if (user.role === 'RESIDENT') {
        $('#resident-tiles').removeClass('hidden');
    }

    $('#logout-btn').on('click', function () { APP.logout(); });
});
