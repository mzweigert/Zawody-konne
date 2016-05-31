/* jshint esnext: true, jquery:true */
$(()=>{

    'use strict';

    var idHorse,
        name,
        gender,
        breeder,
        deleteRow,
        $updateAlert = $('#update-alert'),
        $inputsUpdate = $('#inputs-update').children(),
        $tbody = $('#horses-tbody'),
        $this;

    $.get('./horse/getAllHorses', (response) => {
        makeRowsInTable(response, $tbody);
    });

    $tbody.on('click', '.remove-row', (e) => {

        deleteRow = $(e.target).closest('tr');
    });
    $("#delete-btn").on('click', () => {

        idHorse = deleteRow.children(0).eq(0).text();

        if(typeof null != idHorse && typeof 'undefined' != idHorse ){

            $.ajax({
                url: './horse/deleteHorse',
                data: JSON.stringify({ id: idHorse }),
                type: 'DELETE', 
                dataType: 'JSON', 
                contentType: 'application/json',

            }).success((res) => {
                deleteRow.remove();
            });

        }
    });
    $tbody.on('click', '.update-row', (e) => {


        $this = $(e.target).closest('tr').children();
        $updateAlert.removeClass('in');
        $updateAlert.text('');
        $inputsUpdate.eq(2).children().prop('selected', false);

        idHorse = $this.eq(0).text();
        name = $this.eq(1).text();
        gender = $this.eq(2).text();
        breeder = $this.eq(3).text();

        $inputsUpdate.eq(0).val(idHorse);
        $inputsUpdate.eq(1).val(name);
        $inputsUpdate.eq(2).find('option:contains('+gender+')').prop('selected', true);
        $inputsUpdate.eq(3).val(breeder);

    });
    $('#update-btn').on('click', () => {

        $updateAlert.removeClass('in');
        $updateAlert.text('');

        var newIdHorse = $inputsUpdate.eq(0).val(),
            newName = $inputsUpdate.eq(1).val(),
            newGender = $inputsUpdate.eq(2).val(),
            newBreeder = $inputsUpdate.eq(3).val();


        $.ajax({
            url: './horse/updateHorse',
            type: 'PUT',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                id: idHorse,
                name: newName, 
                gender: newGender,
                breeder: newBreeder
            })

        }).success((res) => {
            $('#update-modal').modal('hide');

            let obj = {
                id: res._id,
                name: res.name,
                gedner: res.gender,
                breeder: res.breeder
            };
            updateRow(obj, $this.parent());

        }).error((err) => { 
            $updateAlert.addClass('in');
            $updateAlert.text(err.responseText); 
        });

    });
    $('#add-btn').click(() => {

        let $addAlert = $('#add-alert');
        $addAlert.removeClass('in');
        $addAlert.text('');

        name = $('#name').val();
        gender = $('#gender').val();
        breeder = $('#breeder').val();

        $.ajax({
            url: './horse/addHorse',
            type: 'Post',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                name: name, 
                gender: gender,
                breeder: breeder
            })

        }).success((res) => {
            let obj = {
                id: res._id,
                name: res.name,
                gedner: res.gender,
                breeder: res.breeder
            };

            createRow(obj, $tbody);

        }).error((err) => { 
            $addAlert.addClass('in');
            $addAlert.text(err.responseText); 
        });
    });

});