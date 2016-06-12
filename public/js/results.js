/* jshint esnext: true, jquery: true*/
/*global io: false */
$(()=> {

    let socket = io.connect('//' + window.location.host),
        compId = $('#compId').attr('value'),
        currHorse = $('#currHorse').attr('value'),
        carousel = $('#carousel'),
        sHorse = $('.select-horse'),
        sGroup = $('.select-group');



    let addResult = (result) => {
        let trArb = $('tbody[data-value="'+ result.horseId + '"]').find('tr[data-value="'+ result.arbiterId._id +'"]');
        trArb.children().remove();
        $('<td>'+ result.arbiterId.firstname + ' ' + result.arbiterId.lastname +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.overall)? result.overall : 'n.o.')  +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.head)? result.head : 'n.o.') +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.body)? result.body : 'n.o.') +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.legs)? result.legs : 'n.o.') +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.movement)? result.movement : 'n.o.') +'</td>').appendTo(trArb);
    };

    carousel.carousel({
        interval: 30000000000000000000000
    });

    $('.change-item').click((e) => {
        let id = $(e.target).attr('data-value'),
            item = $('tbody[data-value="'+ id + '"]').closest('.item').index();
        carousel.carousel(item);
    });

    window.setTimeout(() => {
        if(currHorse !== 'undefined'){

            let opt = $('option[value="'+currHorse+'"]');
            opt.parent().show();
            opt.attr('selected', true);

            $('option[value="'+opt.parent().attr('id')+'"]').attr('selected', true);
            sHorse.attr('disabled', true);
            sGroup.attr('disabled', true);
            $('tbody[data-value="'+currHorse+'"]').closest('.item').addClass('active');

        }
        else {
            $('tbody:first').closest('.item').addClass('active');
        }
    }, 50);

    $.get('./getCompResults', (res) => {
        res.forEach((result) => {
            addResult(result);
        });
    });

    sGroup.change((e)=> {
        let $this = $(e.target),
            idGr = $this.find(':selected').attr('value');


        $('.select-horse').hide(0).find(':selected').removeAttr('selected');
        $('#' + idGr).show('slide', {direction: 'right'}, 200);


    });

    $('#remind-endEst').click((e) => {
        socket.emit('remind-endEst', compId );
    });
    $('#allow-estimation').click((e) => {
        $('#alert').removeClass('in');
        let horseId = $('.select-horse :selected').attr('value');
        if(!horseId){
            $('#alert').addClass('in').text('Wyiberz konia');
            return;
        }

        $('.select-horse').attr('disabled', true);
        $('.select-group').attr('disabled', true);

        socket.emit('setCurrHorse', {
            compId: compId, 
            horseId: horseId
        });
    });

    socket.on('setCurrHorse-' + compId, (horseId) => {
        if(horseId){
            let tbody = $('tbody[data-value="'+ horseId + '"]');

            tbody.children().each((i, v) => {
                $(v).children().not(':first').each((i, v) => {
                    $(v).text('n.o.');
                });
            });

            $(currHorse).attr('value', horseId);
            carousel.carousel(tbody.closest('.item').index());
        }
        else {
            $('currHorse').attr('value', undefined);
            sHorse.attr('disabled', false);
            sGroup.attr('disabled', false);
            sHorse.find(':selected').attr('selected', false);
            sGroup.find(':selected').attr('selected', false);
        }
    });
    socket.on('err', (data) => {
        $('#alert').text(data.err).addClass('in');
    });

    socket.on('updateVoteComp-' + compId, (res) => {
        addResult(res);
    });



});