$(function () {
    var user = APP.getUser();
    if (!user || !APP.isStaff(user.role)) {
        window.location.href = 'machine-login.html';
        return;
    }

    $('#signed-as').text('Signed in as ' + (user.fullName || user.email) + ' · Delivery Staff');

    // Go to the store-parcel screen
    $('[data-action="store"]').on('click', function () {
        window.location.href = 'store-parcel.html';
    });

    // Go to the pickup-parcel screen
    $('[data-action="collect"]').on('click', function () {
        window.location.href = 'pickup-parcel.html';
    });

    // Log out and return to the resident home
    $('#logout-btn').on('click', function () {
        APP.logout('resident-home.html');
    });
});
