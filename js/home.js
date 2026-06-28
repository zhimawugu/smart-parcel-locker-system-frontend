$(function () {
    var user = APP.requireLogin();
    if (!user) { return; }

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
    } else {

    }

    $('#logout-btn').on('click', APP.logout);
});
