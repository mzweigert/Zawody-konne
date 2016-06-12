/* jshint esnext: true, jquery: true*/
$(()=>{

    'use strict';

    var idUser,
        username,
        password,
        firstname,
        lastname,
        role,
        deleteRow,
        $updateAlert = $('#update-alert'),
        $inputsUpdate = $('#inputs-update').children(),
        $tbody = $('#users-tbody'),
        $this;

    let createObj = (elem) => {
        return {
            id: elem._id,
            username: elem.username,
            password: elem.password,
            firstname: elem.firstname,
            lastname: elem.lastname,
            role: elem.role

        };
    };

    $(window).resize(function() {
        resizeTable($tbody.parent());
    }).resize();
    
    window.setTimeout(() => resizeTable($tbody.parent()), 5);
    
    $tbody.on('click', '.remove-row', (e) => {

        deleteRow = $(e.target).closest('tr');
    });
    $("#delete-btn").on('click', () => {
        let $addAlert = $('#add-alert');
        $addAlert.removeClass('in');
        $addAlert.text('');
        idUser = deleteRow.children(0).eq(0).text();

        $.ajax({
            url: './user/deleteUser',
            data: JSON.stringify({ id: idUser }),
            type: 'DELETE', 
            contentType: 'application/json',

        }).success((res) => {
            deleteRow.css({'background-color': '#d9534f'});
            deleteRow.hide(500);
            window.setTimeout(() => deleteRow.remove(), 500);
        }).error((err) => {
            $addAlert.addClass('in');
            $addAlert.text(err.responseText);
        });
    });
    $tbody.on('click', '.update-row', (e) => {


        $this = $(e.target).closest('tr').children();
        $updateAlert.removeClass('in');
        $updateAlert.text('');
        $inputsUpdate.eq(5).children().prop('selected', false);

        idUser = $this.eq(0).text();
        username = $this.eq(1).text();
        firstname = $this.eq(3).text();
        lastname = $this.eq(4).text();
        role = $this.eq(5).text();


        $inputsUpdate.eq(0).val(idUser);
        $inputsUpdate.eq(1).val(username);
        $inputsUpdate.eq(2).val(firstname);
        $inputsUpdate.eq(3).val(lastname);
        $inputsUpdate.eq(4).find('option:contains('+role+')').prop('selected', true);
    });
    $('#update-btn').on('click', () => {

        $updateAlert.removeClass('in');
        $updateAlert.text('');

        var newIdUser = $inputsUpdate.eq(0).val(),
            newUsername = $inputsUpdate.eq(1).val(),
            newFirstname = $inputsUpdate.eq(2).val(),
            newLastname = $inputsUpdate.eq(3).val(),
            newRole = $inputsUpdate.eq(4).val();

        $.ajax({
            url: './user/updateUser',
            type: 'PUT',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                id: idUser,
                username: newUsername,
                firstname: newFirstname,
                lastname: newLastname,
                role: newRole
            })

        }).success((res) => {
            $('#update-modal').modal('hide');
            updateRow(createObj(res), $this.parent());

        }).error((err) => { 
            $updateAlert.text(err.responseText);
            $updateAlert.addClass('in');
        });

    });
    $('#add-btn').click(() => {

        let $addAlert = $('#add-alert');
        $addAlert.removeClass('in');
        $addAlert.text('');

        username = $('#username').val();
        password = $('#password').val();
        firstname = $('#firstname').val();
        lastname = $('#lastname').val();
        role = $('#role').val();

        $.ajax({
            url: './user/addUser',
            type: 'Post',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                id: idUser,
                username: username,
                password: password,
                firstname: firstname,
                lastname: lastname,
                role: role
            })

        }).success((res) => {
            createRow(createObj(res), $tbody);
            $tbody.scrollTop($tbody[0].scrollHeight);
            $tbody.children().last().css({backgroundColor: '#5cb85c'});
            $tbody.children().last().animate({backgroundColor: 'transparent'}, 1000);
        }).error((err) => {
            $addAlert.addClass('in').text(err.responseText);
        });
    });

});