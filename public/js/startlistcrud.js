/* jshint esnext: true, jquery: true*/
$(() => {

    let $this,
        ahSelect = $('#available-horses'),
        shSelect = $('#selected-horses'),
        $goToGroups =$('#done-alert'),
        $GTGBtn = $('<button id="go-to-groups" type="button" class="btn btn-default">' + 
                    '<a href="./addGroups">Przejdź do grup</a>' + 
                    '<span class="glyphicon glyphicon-forward"></span>' +
                    '</button>');


    let sortSHSelect = () => {
        shSelect.children().each(function(e){
            $this = $(this);
            console.log($this.text().substring(2, $this.text().length));
            $this.text(e+1 +'.'+ $this.text().substring($this.text().indexOf('.') +1, $this.text().length));
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
    $.get('../'+$('#idComp').text()+ '/getReferringHorses/' , (res) => {

        if(res.Klacz || res.Ogier){
            enableBtn(false);
            $goToGroups.addClass('in');
            $goToGroups.text('Te zawody posiadają już dodaną liste startową. Zaktualizuj lub przejdź do grup.');
            $goToGroups.append($GTGBtn);
        }
        if(res.Klacz){
            res.Klacz.forEach((elem) => {
                $('#selected-horses').append('<option value="' + elem.horse._id + '">'+ elem.startNumber +'.'+elem.horse.name+ ' p:'+elem.horse.gender +'</option>');
            });
        }
        if(res.Ogier){
            res.Ogier.forEach((elem) => {
                $('#selected-horses').append('<option value="' + elem.horse._id + '">'+ elem.startNumber +'.'+elem.horse.name+ ' p:'+elem.horse.gender +'</option>');
            });
        }

    }).then((res) => {
        $.get('../'+$('#idComp').text() + '/getAvailableHorses/', (res) => {
            res.forEach((elem) => {
                $('#available-horses').append('<option value="' + elem._id + '">' + elem.name + ' p:' + elem.gender + '</option>');
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
            url: '../addOrUpdateReferringHorses',
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

});