/* jshint esnext: true, jquery:true */
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
        $tbody = $('#horses-tbody'),
        $this;

    $.get('./getAllUsers', (response) => {
        let userArr = [];
        response.forEach((elem) => {
            let obj = {
                id: elem._id,
                username: elem.username,
                password: elem.password,
                firstname: elem.firstname,
                lastname: elem.lastname,
                role: elem.role

            };
            userArr.push(obj);
        });
        makeRowsInTable(userArr, $tbody);
    });

    $tbody.on('click', '.remove-row', (e) => {

        deleteRow = $(e.target).closest('tr');
    });
    $("#delete-btn").on('click', () => {
        let $addAlert = $('#add-alert');
        $addAlert.removeClass('in');
        $addAlert.text('');
        idUser = deleteRow.children(0).eq(0).text();

        if(typeof null != idUser && typeof 'undefined' != idUser ){

            $.ajax({
                url: './deleteUser',
                data: JSON.stringify({ id: idUser }),
                type: 'DELETE', 
                dataType: 'JSON', 
                contentType: 'application/json',

            }).success((res) => {
                deleteRow.remove();
            }).error((err) => {
                $addAlert.addClass('in');
                $addAlert.text(err.responseText);
            });

        }
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


        console.log(newRole);
        if(idUser === '' || typeof idUser === 'undefined' || idUser !== newIdUser){
            $('#update-modal').modal('hide');

        }
        else if(newUsername === username &&
                newFirstname === firstname &&
                newLastname === lastname &&
                newRole === role) {

            $('#update-modal').modal('hide');
        }
        else if(newUsername.length < 2 || newUsername.length > 10){

            $updateAlert.text('Username musi miec minimum 5 i maksimum 10 znakow');
            $updateAlert.addClass('in');
        }
        else if(newFirstname.length < 2 || newFirstname.length > 30 || newLastname.length < 2 || newLastname.length > 30){
            $updateAlert.text('Imie i nazwisko musi miec minimum 2 znaki i maksium 30 znakow!');
            $updateAlert.addClass('in');
        }
        else if( newRole !== 'admin' && newRole !== 'arbiter') {

            $updateAlert.text('Nieprawidlowa rola!');
            $updateAlert.addClass('in');
        }
        else {

            $.ajax({
                url: './updateUser',
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

                let obj = {
                    id: res._id,
                    username: res.username,
                    password: res.password,
                    firstname: res.firstname,
                    lastname: res.lastname,
                    role: res.role
                };
                updateRow(obj, $this.parent());

            }).error((err) => { 
                $updateAlert.text(err.responseText);
                $updateAlert.addClass('in');
            });
        }

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



        if(username.length < 2 || username.length > 10){

            $addAlert.text('Login musi miec minimum 5 i maksimum 10 znakow');
            $addAlert.addClass('in');
            console.log(username, password, firstname, lastname, role);
        }
        else if(password.length < 6 || password.length > 15){
            $addAlert.text('Hasło musi miec minimum 6 znakow i maksimum 15 znaków!');
            $addAlert.addClass('in');
        }
        else if(firstname.length < 2 || firstname.length > 30 || lastname.length < 2 || lastname.length > 30){
            $addAlert.text('Imie i nazwisko musi miec minimum 2 znaki i maksium 30 znakow!');
            $addAlert.addClass('in');
        }
        else if( role !== 'admin' && role !== 'arbiter') {

            $addAlert.text('Nieprawidlowa rola!');
            $addAlert.addClass('in');
        }
        else {
            $.ajax({
                url: './addUser',
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
                let obj = {
                    id: res._id,
                    username: res.username,
                    password: res.password,
                    firstname: res.firstname,
                    lastname: res.lastname,
                    role: res.role
                };

                createRow(obj, $tbody);

            }).error((err) => { 
                $addAlert.text(err.responseText);
                $addAlert.addClass('in');
            });

        }
    });

});