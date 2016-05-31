/* jshint esnext: true, jquery:true */
$(()=>{

    'use strict';

    var idCompetition,
        name = $("#name"),
        startDate = $("#start-date"),
        arbitersCount = $("#arbiters-count"),
        ratesType = $("#rates-type"),
        ratestInterval = $("#rates-interval"),
        $updateAlert = $('#update-alert'),
        $inputsUpdate = $('#inputs-update').children(),
        $tbody = $('#competitions-tbody'),
        $this;



    startDate.datetimepicker({
        format: 'YYYY-MM-DD HH:mm',
        sideBySide: true
    });

    $.get('./competition/getAllCompetitions', (response) => {
        let arr = [];
        response.forEach((elem) => {
 
            let obj = {
                id: elem._id,
                name: elem.meta.name,
                startDate: elem.meta.startDate,
                arbitersCount: elem.meta.arbitersCount,
                ratesType: elem.meta.ratesType,
                startList: '<td><a href="./competition/'+ elem._id+'/startList">Przejdź do listy startowej</a></td>'
            };
            arr.push(obj);
        });
        makeRowsInTable(arr, $tbody);
    });

    $('#add-btn').click(() => {

        let $addAlert = $('#add-alert');
        $addAlert.removeClass('in');
        $addAlert.text('');

        console.log(name.val(), startDate.val(), arbitersCount.val());
        $.ajax({
            url: './addCompetitionMeta',
            type: 'Post',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                meta:{
                    name: name.val(), 
                    startDate: startDate.val(),
                    arbitersCount: arbitersCount.val(),
                    ratesType: '10-20-30'
                }
            })

        }).success((res) => {

            let obj = {
                id: res._id,
                name: res.meta.name,
                startDate: res.meta.startDate,
                arbitersCount: res.meta.arbitersCount,
                ratesType: res.meta.ratesType
            };

            createRow(obj, $tbody);

        }).error((err) => {
            $addAlert.addClass('in');
            $addAlert.text(err.responseText);
        });
    });

});