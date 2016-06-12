/* jshint esnext: true, jquery:true */
/*global io: false */
$(() => {

    let socket = io.connect('//' + window.location.host),
        arbiterId = $('#arbiterId').attr('value'),
        ratesInfo = $('#ratesInfo').attr('value'),
        ratesType = ratesInfo.substr(0, ratesInfo.indexOf(' ')),
        ratesInterval = ratesInfo.substr(ratesInfo.indexOf(' ')+1),
        $overall = $('#overall'), $head = $('#head'), $body = $('#body'), $legs = $('#legs'), $movement = $('#movement'),
        sliderStop = (event, ui) =>{

            animObj($(ui.handle), 'transparent');
            $('#alert').removeClass('in');
            $(ui.handle).closest('.row').find('.result').text(ui.value);

            let overall = $overall.closest('.row').find('.result').text(),
                head = $head.closest('.row').find('.result').text(),
                body = $body.closest('.row').find('.result').text(),
                legs = $legs.closest('.row').find('.result').text(),
                movement = $movement.closest('.row').find('.result').text();

            let obj = {
                _id : $('#resultId').attr('value') !== 'undefined'? $('#resultId').attr('value') : undefined,
                compId: $('#compId').attr('value'),
                horseId: $('#horseId').attr('value'),
                overall : isNaN(overall) ? undefined : overall,
                head : isNaN(head) ? undefined : head,
                body : isNaN(body) ? undefined : body,
                legs : isNaN(legs) ? undefined : legs,
                movement : isNaN(movement) ? undefined : movement,
            };

            socket.emit('vote', obj);
        },
        animObj = (obj, bgColor) => {
            if(!bgColor)
                obj.closest('.row').animate({backgroundColor: 'red', borderRadius: '100px'});
            else
                obj.closest('.row').animate({backgroundColor: bgColor, borderRadius: '100px'});
        };



    $( ".slider" ).slider({
        step: ratesType === 'half'? 0.5 : 1,
        min: 0,
        max: ratesInterval === 'ten'? 10 : 20,
        stop: sliderStop
    });
    $('.result').each((i, val) => {

        let $this = $(val);

        if(!isNaN($this.text())){
            $this.parent().prev().children().eq(0).slider('value', $this.text());
        }

    });

    socket.on('err', (data) => {
        $('#alert').addClass('in').text(data.err); 
    });

    socket.on('canStartVote-'+arbiterId, (data) => {


        if(!data){
            $('#no-curr-horse').show(500);
            $('#arbiter-panel').hide(500);
            $('#compId').attr('value', undefined);
            $('#horseId').attr('value', undefined);
            $('#horseDesc').text('');
        }else{
            let result = data.result;
            $('#no-curr-horse').hide(500);
            $('#arbiter-panel').show(500);
            $('#compId').attr('value', result.compId);
            $('#horseId').attr('value', result.horseId.horse);
            $('#horseDesc').text('Nr. startowy: ' + result.horseId.startNumber);
            $('.slider').slider({
                step: result.ratesType.substr(0, result.ratesType.indexOf(' ')) === 'half'? 0.5 : 1,
                min: 0,
                max: result.ratesType.substr(result.ratesType.indexOf(' ') +1) === 'ten'? 10 : 20

            });
        }
    });


    socket.on('remind-'+arbiterId, (result) => {
        if(!result.overall){ animObj($overall); }
        if(!result.head){ animObj($head); }
        if(!result.body){ animObj($body); }
        if(!result.legs){ animObj($legs); }
        if(!result.movement){ animObj($movement); }
        $('#alert').addClass('in').text('Uzupełnij jak najszybciej zaznaczone oceny!');
    });

});
