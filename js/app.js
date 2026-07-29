window.APP = (function () {
    var API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:8080' : '';
    var KEY = 'spl_user';

    function api(method, path, body) {
        return $.ajax({
            url: API_BASE + path,
            method: method,
            contentType: 'application/json',
            data: body ? JSON.stringify(body) : undefined,
            dataType: 'json'
        }).then(function (resp) {
            return resp.code === 0 ? resp.data : $.Deferred().reject(resp.msg).promise();
        }, function () {
            return $.Deferred().reject('Cannot reach the server.').promise();
        });
    }

    return {
        api: api,
        setUser: function (u) { sessionStorage.setItem(KEY, JSON.stringify(u)); },
        getUser: function () { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); },
        logout: function (dest) { sessionStorage.removeItem(KEY); window.location.href = dest || 'index.html'; },
        isStaff: function (role) { return role === 'DELIVERY_STAFF' || role === 'LOCKER_STAFF'; },
        requireRole: function (roles) {
            var user = this.getUser();
            if (!user) { window.location.href = 'index.html'; return null; }
            if ([].concat(roles).indexOf(user.role) < 0) { window.location.href = 'home.html'; return null; }
            return user;
        }
    };
})();
