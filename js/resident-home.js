$(function () {
    // Go to the collect-parcel screen
    $('[data-action="collect"]').on('click', function () {
        window.location.href = 'collect-parcel.html';
    });
    // Go to the send-parcel screen
    $('[data-action="send"]').on('click', function () {
        window.location.href = 'send-parcel.html';
    });
});
