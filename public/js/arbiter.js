/* jshint esnext: true, jquery:true */
/*global io: false */
$(() => {

    let socket = io.connect('//' + window.location.host),
        ratesInfo = $('#ratesInfo').attr('value'),
        ratesType = ratesInfo.substr(0, ratesInfo.indexOf(' ')),
        ratesInterval = ratesInfo.substr(ratesInfo.indexOf(' ')+1),
        sliderStop = (event, ui) =>{
            $(ui.handle).closest('.row').children().eq(2).find('h3').text(ui.value);
            let obj = {
                id : $('#idResult').attr('value') !== 'null'? $('#idResult').attr('value') : undefined,
                idComp: $('#idComp').attr('value'),
                horseId: $('#idHorse').attr('value'),
                arbiterId: $('#idArbiter').attr('value'),
                overall : $('#overall').slider("value"),
                head : $('#head').slider("value"),
                body : $('#body').slider("value"),
                legs : $('#legs').slider("value"),
                movement : $('#movement').slider("value")
            };

            socket.emit('vote', obj);
        };



    $( ".slider" ).slider({
        step: ratesType === 'half'? 0.5 : 1,
        min: 0,
        max: ratesInterval === 'ten'? 10 : 20,
        stop: sliderStop
    });
    $('.result').each(function(){
        let $this = $(this);
        $this.parent().prev().children().eq(0).slider('value', $this.text());
    });
    socket.on('startVote', function(data) {
        if(data){
            socket.emit('startVote');
        }
    });

    socket.on('currentHorse', function(data){
        if(data.err){

            $('#no-curr-horse').show(500);
            $('#arbiter-panel').hide(500);
        }else{

            $('#no-curr-horse').hide(500);
            $('#arbiter-panel').show(500);
            $('#idComp').attr('value', data.idComp);
            $('#idHorse').attr('value', data.currentHorse.horse._id);
            $('#horseDesc').text('Nr. startowy:' + data.currentHorse.startNumber);
            $('.slider').slider({
                step: data.ratesType.substr(0, data.ratesType.indexOf(' ')) === 'half'? 0.5 : 1,
                min: 0,
                max: data.ratesType.substr(data.ratesType.indexOf(' ') +1) === 'ten'? 10 : 20

            });
        }
    });

    socket.on('getIdResult', (id) => {
        $('#idResult').attr('value', id); 
    });
});
