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

    $.get('./getAllHorses', (response) => {
        makeRowsInTable(response, $tbody);
    });

    $tbody.on('click', '.remove-row', (e) => {

        deleteRow = $(e.target).closest('tr');
    });
    $("#delete-btn").on('click', () => {

        idHorse = deleteRow.children(0).eq(0).text();

        if(typeof null != idHorse && typeof 'undefined' != idHorse ){

            $.ajax({
                url: './deleteHorse',
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


        if(idHorse === '' || typeof idHorse === 'undefined' || idHorse !== newIdHorse){
            $('#update-modal').modal('hide');

        }
        else if(newName === name && newBreeder === breeder && newGender === gender){
            $('#update-modal').modal('hide');
        }
        else if(newName.length < 2 || newName.length > 30 || newBreeder.length < 2 || newBreeder.length > 30) {

            $updateAlert.text('Name and breeder should have minimum 3 and maximum 30 characters!');
            $updateAlert.addClass('in');
        }
        else {

            $.ajax({
                url: './updateHorse',
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

            }).error((res) => { console.log(res);  });
        }

    });
    $('#add-btn').click(() => {

        let $addAlert = $('#add-alert');
        $addAlert.removeClass('in');
        $addAlert.text('');

        name = $('#name').val();
        gender = $('#gender').val();
        breeder = $('#breeder').val();


        if(name.length < 2 || 
           name.length > 30 || 
           breeder.length < 2 || 
           breeder.length > 30) {

            $addAlert.text('Name and breeder should have minimum 3 and maximum 30 characters!');
            $addAlert.addClass('in');
        }
        else {
            $.ajax({
                url: './addHorse',
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

            }).error((res) => { console.log(res);  });

        }
    });

    $('.modal').on('hidden', function () {


    });
});