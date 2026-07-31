$(function () {
    var user = APP.requireRole('RESIDENT');
    if (!user) { return; }

    $('#logout-btn').on('click', function () { APP.logout(); });

    var groupId = null;

    // Show a status message in green or red
    function showMsg(text, ok) {
        $('#group-msg').text(text).removeClass('hidden text-danger text-success')
            .addClass(ok ? 'text-success' : 'text-danger');
    }
    function clearMsg() { $('#group-msg').addClass('hidden').text(''); }
    function reenable() { $('#invite-btn').prop('disabled', false).text('Send Invite'); }
    function initial(s) { return (s || '?').charAt(0).toUpperCase(); }

    // Render the list of group members
    function renderMembers(group, canManage) {
        var members = (group && group.members) || [];
        $('#member-count').text(members.length);
        var $list = $('#member-list').empty();
        if (members.length === 0) {
            $list.append('<p class="text-muted">No members yet. Invite someone to get started.</p>');
            return;
        }
        members.forEach(function (m) {
            var isOwnerRow = m.role === 'OWNER';
            var isYou = m.email === user.email;
            var $av = $('<span class="rounded-circle bg-light text-primary fw-bold d-inline-flex align-items-center justify-content-center">')
                .css({ width: '38px', height: '38px', flex: '0 0 38px' })
                .text(initial(m.fullName || m.email));
            var $main = $('<div class="parcel-main">')
                .append($('<div class="parcel-title">').text((m.fullName || m.email) + (isYou ? ' (You)' : '')))
                .append($('<div class="parcel-sub">').text(m.email));
            var $badge = $('<span class="badge rounded-pill">')
                .addClass(isOwnerRow ? 'text-bg-primary' : 'text-bg-secondary')
                .text(isOwnerRow ? 'Owner' : 'Member');
            var $row = $('<div class="parcel-row">').append($av).append($main).append($badge);
            if (canManage && !isOwnerRow) {
                var $rm = $('<button class="btn btn-sm btn-outline-danger ms-2">').text('Remove');
                $rm.on('click', function () { removeMember(m.email); });
                $row.append($rm);
            }
            $list.append($row);
        });
    }

    // Load the current user's group from the server
    function load() {
        APP.api('GET', '/api/groups/mine?email=' + encodeURIComponent(user.email))
            .done(function (group) {
                var isOwner = group && group.ownerEmail === user.email;
                if (group && !isOwner) {
                    groupId = group.id;
                    var owner = group.members.filter(function (m) { return m.role === 'OWNER'; })[0];
                    var ownerName = (owner && (owner.fullName || owner.email)) || group.ownerEmail;
                    $('#group-subtitle').text("You're in " + ownerName + "'s group — you'll automatically get their collection codes.");
                    $('#invite-col').addClass('hidden');
                    $('#members-col').removeClass('col-lg-6').addClass('col-lg-8 mx-auto');
                    renderMembers(group, false);
                } else if (group) {
                    groupId = group.id;
                    $('#invite-col').removeClass('hidden');
                    $('#group-name').val(group.name).prop('readonly', true);
                    renderMembers(group, true);
                } else {
                    groupId = null;
                    $('#invite-col').removeClass('hidden');
                    $('#group-name').prop('readonly', false);
                    renderMembers(null, true);
                }
            })
            .fail(function (msg) { showMsg(msg, false); });
    }

    // Add a member to the group by email
    function addMember(email) {
        APP.api('POST', '/api/groups/' + groupId + '/members', { email: email })
            .done(function () { $('#invite-email').val(''); showMsg('Member added.', true); reenable(); load(); })
            .fail(function (msg) { showMsg(msg, false); reenable(); });
    }

    // Remove a member from the group
    function removeMember(email) {
        APP.api('DELETE', '/api/groups/' + groupId + '/members?email=' + encodeURIComponent(email))
            .done(function () { load(); })
            .fail(function (msg) { showMsg(msg, false); });
    }

    // Create the group if needed, then invite the member
    $('#invite-btn').on('click', function () {
        clearMsg();
        var email = $.trim($('#invite-email').val());
        if (!email) { showMsg('Enter an email to invite.', false); return; }
        $('#invite-btn').prop('disabled', true).text('Sending…');
        if (groupId) {
            addMember(email);
            return;
        }
        var name = $.trim($('#group-name').val()) || ((user.fullName || 'My') + ' Group');
        APP.api('POST', '/api/groups', { ownerEmail: user.email, name: name })
            .done(function (g) { groupId = g.id; addMember(email); })
            .fail(function (msg) { showMsg(msg, false); reenable(); });
    });

    load();
});
