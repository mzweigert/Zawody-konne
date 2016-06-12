/* jshint esnext: true, jquery: true*/
$(() => {

    let name,
        gender = $('#gender'),
        closest,
        gArbiters,
        aArbiters,
        $this;

    if(gender.find(':selected').text() === 'Klacz'){
        $('.mares-rows').css({display: 'block'});
        $('.stallions-rows').css({display: 'none'});
    }
    else{
        $('.stallions-rows').css({display: 'block'});
        $('.mares-rows').css({display: 'none'});
    }

    gender.change(function () {
        let g =$(this).find(':selected').text();

        if(g === 'Klacz'){
            $('.mares-rows').show('500');
            $('.stallions-rows').hide('500');
        }
        else{
            $('.mares-rows').hide('500');
            $('.stallions-rows').show('500');
        }
    });
    let moveArbiters = (from, to) =>{


        from.find(':selected').each(function(){
            $this = $(this);
            to.append($this.clone());
            $this.remove();
        });
    };
    $('.add-btn').click((e) => {

        closest = $(e.target).closest('.col-sm-2');
        aArbiters = closest.prev().children().eq(1);
        gArbiters = closest.next().children().eq(1);
        moveArbiters(aArbiters, gArbiters);
    });

    $('.rem-btn').click((e) => {
        closest = $(e.target).closest('.col-sm-2');
        gArbiters = closest.next().children().eq(1);
        aArbiters = closest.prev().children().eq(1);
        moveArbiters(gArbiters, aArbiters);
    });

    let createGroups = (row, gHorses, gender) => {

        let name,
            horses = [],
            arbiters = [];

        name = row.find('.name-group').val();
        row.find(gHorses).find('option').each(function(){
            horses.push($(this).val());
        });
        row.find('.group-arbiters').find('option').each(function(){
            arbiters.push($(this).val());
        });
        return {
            id: row.attr('id'),
            name: name,
            gender: gender,
            horses: horses,
            arbiters: arbiters
        };

    };
    $('.add-group-btn, .edit-group-btn').click((e) => {


        let $this = $(e.target).closest('.row'),
            group,
            url = '../' + window.location.pathname.split('/').pop();


        if($this.hasClass('mare-row')){
            group = createGroups($this, '.group-mares', 'Klacz');
        }
        else{
            group = createGroups($this, '.group-stallions', 'Ogier');
        }

        $.ajax({
            url:  url.substring(0, url.length - 1),
            type: 'POST',
            dataType: 'JSON', 
            contentType: 'application/json',
            data:  JSON.stringify({
                id: $('#idComp').text(),
                group: group
            })
        }).success((res) => {


            $('.name-group').animate({'background-color': "white"}, 250);
            $('.multiple-select').first().animate({'background-color': "white"}, 250);
            $('.multiple-select').not(":first").animate({'background-color': "white"}, 250);
            if(url !== '../editGroups'){
                $('#alert').removeClass('in').text('');
                $(e.target).attr('disabled', true);
                $this.hide(500);
                window.setTimeout(() => {


                    let sr = $('.stallions-rows'),
                        mr = $('.mares-rows');
                    
                    $this.remove();
                    if(!mr.children().length && mr.length){
                        mr.remove();
                        sr.show('500');
                        gender.find('option:contains(Klacz)').remove();
                    }
                    else if(!sr.children().length && sr.length){
                        sr.remove();
                        mr.show('500');
                        gender.find('option:contains(Ogier)').remove();
                    }

                    if(!$('.stallions-rows').length && !$('.mares-rows').length){

                        let content = '<p>Grupy zostały już dodane. Przejdź do zawodów lub edytuj grupy</p>' + 
                            '<div class="form-inline">' + 
                            '<a type="button" class="btn btn-success" href="./editGroups"> Edycja grup</a>' +
                            '<a type="button" class="btn btn-success" href="./results"> Wyniki</a>' +
                            '</div>';
                        $('.groups').children().remove();
                        $(content).appendTo('.groups');
                    }

                }, 500);


            }else{

                $('.mare-row').animate({backgroundColor: 'white'});
                $this.animate({backgroundColor: '#95d095'});
                $('#alert').removeClass('alert-danger').addClass('alert-success in').text('Pomyślnie zaktualizowano grupę');
            }

        }).error((err) => {

            let errJson = err.responseJSON,
                highLightArea,
                rowGroup = $('#'+errJson.fail.id);


            $('#alert').removeClass('in').removeClass('alert-success').addClass('alert-danger').text('');
            rowGroup.find('.name-group').animate({'background-color': "white"}, 250);
            rowGroup.find('.multiple-select').first().animate({'background-color': "white"}, 250);
            rowGroup.find('.multiple-select').not(":first").animate({'background-color': "white"}, 250);

            if(errJson.typeErr){

                if(errJson.typeErr === 'name'){
                    highLightArea = rowGroup.find('.name-group');
                }
                else if(errJson.typeErr === 'horses'){

                    highLightArea = rowGroup.find('.multiple-select').first();
                }
                else{
                    highLightArea = rowGroup.find('.multiple-select').not(":first");
                }

                highLightArea.animate({'background-color': "#ff8080"}, 250);
                $('#alert').addClass('in').text(errJson.message);

            }

        });
    });


});
