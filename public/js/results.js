/* jshint esnext: true, jquery: true*/
/*global io: false */
$(()=> {



    let allEst = io.connect('//' + window.location.host),
        idComp = $('#idComp').attr('value'),
        $tbody = $('#results-tbody');

    $.get('../' + idComp + '/getCurrentHorse', (id) => {
        let opt = $('option[value="'+id+'"]');
        opt.parent().show();
        opt.attr('selected', true);
        $('option[value="'+opt.parent().attr('id')+'"]').attr('selected', true);
        $('.select-horse').attr('disabled', true);
        $('.select-group').attr('disabled', true);
        $('#results').show(500);
        $.get('../' + idComp + '/getCurrentHorseResults', (results) => {
            results.forEach((result) => {

            });
        });
    });

    $('.select-group').change((e)=> {
        let $this = $(e.target),
            idGr = $this.find(':selected').attr('value');

        $('.select-horse').hide(250).find(':selected').removeAttr('selected');

        window.setTimeout(() =>  $('#' + idGr).show(500), 300);
    });

    $('#allow-estimation').click((e) => {
        $('#alert').removeClass('in');
        let idHorse = $('.select-horse :selected').attr('value');
        if(!idHorse){
            $('#alert').addClass('in').text('Wyiberz konia');
            return;
        }

        $('.select-horse').attr('disabled', true);
        $('.select-group').attr('disabled', true);
        $('#results').show(500);

        /*  $.ajax({
            url: '/admin/competition/updateCurrentHorse',
            type: 'POST',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                idComp: idComp,
                idHorse: idHorse
            })

        }).success((res)=>{
            console.log(res);
        }).error((err) =>{
            if(err.responseJSON)
             $('#alert').addClass('in').text(err.responseJSON.message);
        });
*/
        allEst.emit('updCurrHor', {
            idComp: idComp, 
            idHorse: idHorse
        });
    });


    allEst.on('err', function(data) {
        console.log(data.err);
    });

    allEst.on('updateVote', (res) => {
      
        console.log($tbody);
        let obj = {
            arbiter: res.arbiter,
            overall: res.overall,
            head: res.head,
            body: res.body,
            legs: res.legs,
            movement:  res.movement
        };

        createRow(obj, $tbody);
    });

});