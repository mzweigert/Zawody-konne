/* jshint esnext: true, jquery: true*/
$(() => {

    let $this,
        ahSelect = $('#available-horses'),
        shSelect = $('#selected-horses'),
        $goToGroups =$('#done-alert'),
        $GTGBtn = $('<button id="go-to-groups" type="button" class="btn btn-default">' + 
                    '<a href="./startList/groups">Przejdź do grup</a>' + 
                    '<span class="glyphicon glyphicon-forward"></span>' +
                    '</button>');


    let sortSHSelect = () => {
        shSelect.children().each(function(e){
            $this = $(this);
            $this.text(e+1 +'.'+ $this.text().substring(2, $this.text().length));
        });
    };
    $('[data-toggle="tooltip"]').tooltip(); 
    
    let enableBtn = (stmnt) => {
        if(stmnt){
            $('#add-start-list').removeAttr('disabled');
        }
        else{
            $('#add-start-list').attr('disabled', 'true'); 
        }
    };
    $.get('../getCompetitionReferringHorses/'+ $('#idComp').text() , (res) => {

        if(res.length){
            enableBtn(false);
            $goToGroups.addClass('in');
            $goToGroups.text('Te zawody posiadają już dodaną liste startową. Zaktualizuj lub przejdź do grup.');
            $goToGroups.append($GTGBtn);
        }

        res.forEach((elem) => {

            $.get('../../horse/findHorseById/' +elem.horse , (res) => { 
                $('#selected-horses').append('<option value="' + res._id + '">'+ elem.startNumber +'.'+res.name+ ' p:'+res.gender +'</option>');
            });
        });

    }).then((res) => {
        $.get('../../horse/getAllHorses', (res) => {
            res.forEach((elem) => {
                $.get('../../horse/findHorseById/' + elem._id , (res) => { 
                    let $found = shSelect.find('option[value="'+ res._id +'"]');
                    if(!$found.length)
                        $('#available-horses').append('<option value="' + res._id + '">' + res.name + ' p:' + res.gender + '</option>');
                });
            });
        });
    });

    $('#add-btn').click(() => {
        enableBtn(ahSelect.find(':selected').length);
        ahSelect.find(':selected').each(function(){
            let startN = shSelect.find('option').length+1;
            shSelect.append('<option value="' +$ (this).val() + '">'+startN +'.'+$(this).text() + '</option>');
            $(this).remove();
        });

    });

    $('#remove-btn').click(() => {
        enableBtn(shSelect.find(':selected').length);
        shSelect.find(':selected').each(function(){

            $this = $(this);
            ahSelect.append('<option value="' + $this.val() + '">'+ $this.text().substring(2, $this.text().length) + '</option>');
            $this.remove();
        });

        sortSHSelect();
    });

    $('#move-up').click(() => { 
        enableBtn(shSelect.find(':selected').length);
        shSelect.find(':selected').each(function(){
            $this = $(this);
            $this.prev().before($this);
        });
        sortSHSelect();
    });

    $('#move-down').click(() => { 
        enableBtn(shSelect.find(':selected').length);
        $(shSelect.find(':selected').get().reverse()).each(function() {
            $this = $(this);
            $this.next().after($this);
        });
        sortSHSelect();
    });

    $('#add-start-list').click(() => { 

        let $alert = $('#alert');
        $alert.removeClass('in');

        let horsesAdded = [];
        shSelect.children().each(function() {
            $this = $(this);
            horsesAdded.push({
                horse:$this.val(), 
                startNumber: parseInt($this.text().substr(0, 2)),
                gender: $this.text().substr($this.text().indexOf('p:') +2)
            });
        });

        $.ajax({
            url: '../../competition/addOrUpdateCompetitionReferringHorses',
            type: 'POST',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                id: $('#idComp').text(),
                referringHorses: horsesAdded
            })
        }).success((res) => {

            if(res.horsesNotAdded.length){
                res.horsesNotAdded.forEach((elem) => {
                    let option = shSelect.find('option[value="' + elem.horse +'"]');
                    option.text(option.text().substring(2));
                    ahSelect.append(option.clone());
                    option.remove();
                });
                 $goToGroups.text('Lista startowa zedytowana, lecz nie dodano wszystkich koni. Sprawdź ikonę informacji.');
            }
            else{
                $goToGroups.text('Lista startowa dodana.');
            }
            $goToGroups.addClass('in');
            $goToGroups.append($GTGBtn);
            enableBtn(false);

        }).error((err) => {
       
            $alert.addClass('in');
            $alert.text(err.responseText);
        });
    });

    $('.container').on('click', '#go-to-groups', (e) => {

    });
});