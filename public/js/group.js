/* jshint esnext: true, jquery:true */
/*global io: false */
$(()=>{
    'use strict';
    let socket = io.connect('//' + window.location.host);

    let getCH = () => {
        $.get('../../getCurrentHorseResults/' + $('#groupId').attr('value'), (res) => {
            $('#horse-desc').remove();
            $('#current-horse').prepend('<p id="horse-desc"> Aktualnie oceniany koń: ' +res.horse.startNumber + ". " + res.horse.horse.name);
            res.results.forEach((result) => {
                addResult(result); 
            });
        }).error((err) => {

            if(err.status === 404){
                $('#current-horse').children().remove();
                $('#current-horse').prepend('<p>Brak akutalnie ocenianego konia w tej grupie</p>');

            }
        });  
    };
    let addResult = (result) => {

        let trArb = $('#'+result.arbiterId._id);
        trArb.children().remove();
        $('<td>'+ result.arbiterId.firstname + ' ' + result.arbiterId.lastname +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.type)? result.type : '')  +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.head)? result.head : '') +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.neck)? result.neck : '')  +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.body)? result.body : '') +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.legs)? result.legs : '') +'</td>').appendTo(trArb);
        $('<td>'+ (!isNaN(result.movement)? result.movement : '') +'</td>').appendTo(trArb);

    };

    getCH();

    socket.on('updateHorse-'+ $('#groupId').attr('value') , (result) => {
        if(result){
            addResult(result); 
        } 
        else {
            $.get('../../getGroupResults/'+$('#groupId').attr('value'), (res) => {
                $('#groups').children().remove();
                res.forEach((elem, i) => {
                    let tr = $('<tr></tr>').appendTo($('#groups'));

                    $('<td>' + (i+1) + '</td>').appendTo(tr);
                    $('<td>' + elem.average + '</td>').appendTo(tr);
                    $('<td>' + elem.horse.startNumber + '</td>').appendTo(tr);
                    $('<td>' + elem.horse.horse.name + '</td>').appendTo(tr);

                });
            });
            window.setTimeout(() => { getCH(); }, 500);
        }

    });


});