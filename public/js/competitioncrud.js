/* jshint esnext: true, jquery:true */
$(()=>{

    'use strict';

    var idCompetition,
        name = $("#name"),
        startDate = $("#start-date"),
        arbitersCount = $("#arbiters-count"),
        ratesType = $("#rates-type"),
        ratesInterval = $("#rates-interval"),
        $updateAlert = $('#update-alert'),
        $inputsUpdate = $('#inputs-update').children(),
        $tbody = $('#competitions-tbody'),
        $this,
        deleteRow;



    startDate.datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
        sideBySide: true,
        keepOpen: true
  
   
    });
    $inputsUpdate.eq(2).datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
        sideBySide: true
    });

    $(window).resize(function() {
        resizeTable($tbody.parent());
    }).resize();

    let createObj = (elem) => {
        let ratesInfo = elem.meta.ratesType;
        let type = ratesInfo.substr(0, ratesInfo.indexOf(' ')),
            interval = ratesInfo.substr(ratesInfo.indexOf(' ') +1);

        return {
            id: elem._id,
            name: elem.meta.name,
            startDate: elem.meta.startDate,
            arbitersCount: elem.meta.arbitersCount,
            ratesType:  $("#rates-type").find('option[value="'+type+'"]').text() + ' ' + $("#rates-interval").find('option[value="'+interval+'"]').text(),
            startList: '<td><a href="./competition/'+ elem._id+'/startList">Lista startowa</a></td>'
        };
    };
    $.get('./competition/getAllCompetitions', (response) => {
        let arr = [];

        response.forEach((elem) => {
            arr.push(createObj(elem));
        });

        makeRowsInTable(arr, $tbody);
        resizeTable($tbody.parent());
    });
    $tbody.on('click', '.remove-row', (e) => {

        deleteRow = $(e.target).closest('tr');
    });
    $("#delete-btn").on('click', () => {

        idCompetition = deleteRow.children(0).eq(0).text();

        if(idCompetition){

            $.ajax({
                url: './competition/deleteCompetition',
                data: JSON.stringify({ id: idCompetition }),
                type: 'DELETE', 
                dataType: 'JSON', 
                contentType: 'application/json',

            }).success((res) => {
                deleteRow.css({'background-color': '#d9534f'});
                deleteRow.hide(500);
                window.setTimeout(() => deleteRow.remove(), 500);
            });

        }
    });
    $tbody.on('click', '.update-row', (e) => {


        $this = $(e.target).closest('tr').children();
        $updateAlert.removeClass('in');
        $updateAlert.text('');

        $inputsUpdate.eq(4).children().prop('selected', false);
        $inputsUpdate.eq(5).children().prop('selected', false);

        idCompetition = $this.eq(0).text();
        name = $this.eq(1).text();
        startDate = $this.eq(2).text();
        arbitersCount = $this.eq(3).text();
        ratesType = $this.eq(4).text();

        $inputsUpdate.eq(0).val(idCompetition);
        $inputsUpdate.eq(1).val(name);
        $inputsUpdate.eq(2).val(startDate);
        $inputsUpdate.eq(3).val(arbitersCount);
        $inputsUpdate.eq(4).find('option:contains('+ratesType.substr(0, ratesType.indexOf(' '))+')').prop('selected', true);
        $inputsUpdate.eq(5).find('option:contains('+ratesType.substr(ratesType.indexOf(' ')+1) +')').prop('selected', true);
    });
    $('#update-btn').on('click', () => {

        $updateAlert.removeClass('in');
        $updateAlert.text('');

        let newName = $inputsUpdate.eq(1).val(),
            newStartDate = $inputsUpdate.eq(2).val(),
            newArbitersCount = $inputsUpdate.eq(3).val(),
            newRatesType = $inputsUpdate.eq(4).val(),
            newRatesInterval = $inputsUpdate.eq(5).val();

        $.ajax({
            url: './competition/updateCompetitionMeta',
            type: 'PUT',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                meta: {
                    id: $inputsUpdate.eq(0).val(),
                    name: newName, 
                    startDate: newStartDate,
                    arbitersCount: newArbitersCount,
                    ratesType: newRatesType + ' ' + newRatesInterval  
                }
            })

        }).success((res) => {
            $('#update-modal').modal('hide');
            updateRow(createObj(res), $this.parent());
        }).error((err) => { 
            $updateAlert.addClass('in');
            $updateAlert.text(err.responseText); 
        });

    });
    $('#add-btn').click(() => {

        let $addAlert = $('#add-alert');
        $addAlert.removeClass('in');
        $addAlert.text('');

        $.ajax({
            url: './competition/addCompetitionMeta',
            type: 'Post',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                meta:{
                    name: name.val(), 
                    startDate: startDate.val(),
                    arbitersCount: arbitersCount.val(),
                    ratesType: ratesType.val() + ' ' + ratesInterval.val()
                }
            })

        }).success((res) => {
            createRow(createObj(res), $tbody);
            $tbody.scrollTop($tbody[0].scrollHeight);
            $tbody.children().last().css({backgroundColor: '#5cb85c'});
            $tbody.children().last().animate({backgroundColor: 'transparent'}, 1000);
        }).error((err) => {
            $addAlert.addClass('in');
            $addAlert.text(err.responseText);
        });
    });

});