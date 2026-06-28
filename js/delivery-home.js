$(function () {
    var user = APP.getUser();
    if (!user || !APP.isStaff(user.role)) {
        window.location.href = 'machine-login.html';
        return;
    }

    $('#signed-as').text('Signed in as ' + (user.fullName || user.email) + ' · Delivery Staff');

    $('[data-action="store"]').on('click', function () {
        window.location.href = 'store-parcel.html';
    });

    $('#logout-btn').on('click', function () {
        APP.logout('resident-home.html');
    });
});
