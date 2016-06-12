/* jshint esnext: true, jquery:true */
$(()=>{

    'use strict';

    var idHorse,
        name,
        gender,
        breeder,
        deleteRow,
        $updateAlert = $('#update-alert'),
        $alert = $('#alert'),
        $inputsUpdate = $('#inputs-update').children(),
        $tbody = $('#horses-tbody'),
        $this,
        createHorse = (horse) => {
            return {
                id: horse._id,
                name: horse.name,
                gedner: horse.gender,
                breeder: horse.breeder
            };
        };

    window.setTimeout(() => resizeTable($tbody.parent()), 5);
    $(window).resize(function() {
        resizeTable($tbody.parent());
    }).resize();
    
    $tbody.on('click', '.remove-row', (e) => {
        deleteRow = $(e.target).closest('tr');
    });
    $("#delete-btn").on('click', () => {

        $alert.removeClass('in').text('');
        idHorse = deleteRow.children(0).eq(0).text();

        if(typeof null != idHorse && typeof 'undefined' != idHorse ){

            $.ajax({
                url: './horse/deleteHorse',
                data: JSON.stringify({ id: idHorse }),
                type: 'DELETE', 
                contentType: 'application/json',
            }).success((res) => {
                console.log("DUPA");
                deleteRow.css({'background-color': '#d9534f'});
                deleteRow.hide(500);
                window.setTimeout(() => deleteRow.remove(), 500);

            }).error((err) => {
                $alert.addClass('in').text(err.responseText);
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
            updateRow(createHorse(res), $this.parent());
        }).error((err) => { 
            $updateAlert.addClass('in').text(err.responseText);
        });

    });


    $('#add-btn').click(() => {

        $alert.removeClass('in').text('');

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
            createRow(createHorse(res), $tbody);
            $tbody.scrollTop($tbody[0].scrollHeight);
            $tbody.children().last().css({backgroundColor: '#5cb85c'});
            $tbody.children().last().animate({backgroundColor: 'transparent'}, 1000);

        }).error((err) => { 
            $alert.addClass('in').text(err.responseText);
        });
    });
    
       //resizeTable($tbody.parent());

});