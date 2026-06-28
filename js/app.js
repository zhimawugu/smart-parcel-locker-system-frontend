window.APP = (function () {
    var API_BASE = 'http://localhost:8080';
    var SESSION_KEY = 'spl_user';

    function api(method, path, body) {
        return $.ajax({
            url: API_BASE + path,
            method: method,
            contentType: 'application/json',
            data: body ? JSON.stringify(body) : undefined,
            dataType: 'json'
        }).then(function (resp) {
            if (resp && resp.code === 0) {
                return resp.data;
            }
            return $.Deferred()
                .reject(resp ? resp.msg : 'Unknown error', resp ? resp.code : -1)
                .promise();
        }, function (xhr) {
            var msg = 'Cannot reach the server. Is the backend running?';
            if (xhr.responseJSON && xhr.responseJSON.msg) {
                msg = xhr.responseJSON.msg;
            }
            return $.Deferred().reject(msg, xhr.status).promise();
        });
    }

    function setUser(user) {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }

    function getUser() {
        var raw = sessionStorage.getItem(SESSION_KEY);
        return raw ? JSON.parse(raw) : null;
    }

    function logout(dest) {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.href = dest || 'index.html';
    }

    function requireLogin() {
        var user = getUser();
        if (!user) {
            window.location.href = 'index.html';
        }
        return user;
    }

    function isStaff(role) {
        return role === 'DELIVERY_STAFF' || role === 'LOCKER_STAFF';
    }

    return {
        API_BASE: API_BASE,
        api: api,
        setUser: setUser,
        getUser: getUser,
        logout: logout,
        requireLogin: requireLogin,
        isStaff: isStaff
    };
})();
