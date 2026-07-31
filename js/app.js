window.APP = (function () {
    var API_BASE = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') ? 'http://localhost:8080' : '';
    var KEY = 'spl_user';

    // Wrap jQuery AJAX and unwrap the API response envelope
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
        // Save the logged-in user to session storage
        setUser: function (u) { sessionStorage.setItem(KEY, JSON.stringify(u)); },
        // Read the logged-in user from session storage
        getUser: function () { return JSON.parse(sessionStorage.getItem(KEY) || 'null'); },
        // Clear the session and redirect to a page
        logout: function (dest) { sessionStorage.removeItem(KEY); window.location.href = dest || 'index.html'; },
        // True if the role is any staff role
        isStaff: function (role) { return role === 'DELIVERY_STAFF' || role === 'LOCKER_STAFF'; },
        // Redirect away unless the user has an allowed role
        requireRole: function (roles) {
            var user = this.getUser();
            if (!user) { window.location.href = 'index.html'; return null; }
            if ([].concat(roles).indexOf(user.role) < 0) { window.location.href = 'home.html'; return null; }
            return user;
        }
    };
})();
