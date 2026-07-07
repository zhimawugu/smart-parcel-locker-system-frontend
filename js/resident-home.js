$(function () {
    $('[data-action="collect"]').on('click', function () {
        window.location.href = 'collect-parcel.html';
    });
    $('[data-action="send"]').on('click', function () {
        window.location.href = 'send-parcel.html';
    });
});
