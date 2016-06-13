/* jshint esnext: true, jquery: true*/
$(() => {

    let $this,
        ahSelect = $('#available-horses'),
        shSelect = $('#selected-horses'),
        $goToGroups =$('#done-alert'),
        $GTGBtn = $('<a id="go-to-groups" type="button" class="btn btn-default" href="./addGroups">' + 
                    'Przejdź do grup' + 
                    '<span class="glyphicon glyphicon-forward"></span>' +
                    '</a>'),
        ColorArrMare = ["Aquamarine","Bisque","Blue","BlueViolet","Brown","BurlyWood","CadetBlue","Chartreuse","Chocolate","Coral","CornflowerBlue","Cornsilk","Crimson","Cyan","DarkBlue","DarkCyan","DarkGoldenRod","DarkGray","DarkGrey","DarkGreen","DarkKhaki","DarkMagenta","DarkOliveGreen","Darkorange","DarkOrchid","DarkRed","DarkSalmon","DarkSeaGreen","DarkSlateBlue","DarkSlateGray","DarkSlateGrey","DarkTurquoise","DarkViolet","DeepPink","DeepSkyBlue","DimGray","DimGrey","DodgerBlue","FireBrick","FloralWhite","ForestGreen","Fuchsia","Gainsboro","GhostWhite","Gold","GoldenRod","Gray","Grey","Green","GreenYellow","HoneyDew","HotPink","IndianRed","Indigo","Ivory","Khaki","Lavender","LavenderBlush","LawnGreen","LemonChiffon","LightBlue","LightCoral","LightSalmon","LightSeaGreen","LightSkyBlue", "Tan","Teal"],
        ColorArrStall = ["LightSteelBlue","Lime","Linen","Magenta","Maroon","MediumAquaMarine","MediumBlue","MediumOrchid","MediumPurple","MediumSeaGreen","MediumSlateBlue","MediumSpringGreen","MediumTurquoise","MediumVioletRed","MidnightBlue","MintCream","MistyRose","Moccasin","NavajoWhite","Navy","OldLace","Olive","OliveDrab","Orange","OrangeRed","Orchid","LightCyan","LightGoldenRodYellow","LightGray","LightGrey","LightGreen","LightPink","PaleGoldenRod","PaleGreen","PaleTurquoise","PaleVioletRed","PapayaWhip","PeachPuff","Peru","Pink","Plum","PowderBlue","Purple","Red","RosyBrown","RoyalBlue","SaddleBrown","Salmon","SandyBrown","SeaGreen","SeaShell","Sienna","Silver","SkyBlue","SlateBlue","SlateGray","SlateGrey","Snow","SpringGreen","SteelBlue","Thistle","Tomato","Turquoise","Violet","Wheat","White","WhiteSmoke","Yellow","YellowGreen"];


    let sortSHSelect = () => {
        shSelect.children().each(function(e){
            $this = $(this);
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


    $('#search-horse').keyup((e)=>{
        let val = $(e.target).val(),
            opt;

        ahSelect.find('option').attr('hidden', true);
        let foundOpts = ahSelect.find('option').filter(function() { 
            opt = $(this).text();
            return opt.substr(0, val.length) === val; 
        });
        foundOpts.removeAttr('hidden');

    });

    let markGroup = (options,  colorArr, i) => {

        let k = options.length;

        if(!k || k === 1 || k === 2)
            return;
        if(!i)
            i = 0;

        if(k % 5 === 0){
            $(options.splice((k - 5), 5)).css({backgroundColor: colorArr[i]});
            return markGroup(options.splice(0 , k - 5), colorArr, ++i);
        }else if(k % 4 === 0){
            $(options.splice((k - 4), 4)).css({backgroundColor: colorArr[i]});
            return markGroup( options.splice(0 , k - 4), colorArr, ++i);
        }else if(k % 3 === 0){

            $(options.splice((k - 3), 3)).css({'background-color': colorArr[i]});
            return markGroup(options.splice(0 , k - 3), colorArr, ++i);
        }else if(k % 3 === 1){
            $(options.splice((k - 4), 4)).css({backgroundColor: colorArr[i]});
            return markGroup(options.splice(0 , k - 4), colorArr, ++i);
        }
        else{
            $(options.splice((k - 3), 3)).css({backgroundColor: colorArr[i]});
            return markGroup(options.splice(0 , k - 5), colorArr, ++i);
        }

    };
    markGroup(shSelect.find('option:contains("Klacz")').toArray(), ColorArrMare);
    markGroup(shSelect.find('option:contains("Ogier")').toArray(), ColorArrStall);
    $('#include-btn').click(() => {

        enableBtn(ahSelect.find(':selected').length);
        ahSelect.find(':selected').each(function(){
            let startN = shSelect.find('option').length+1;
            shSelect.append('<option value="' +$ (this).val() + '">'+startN +'.'+$(this).text() + '</option>');
            $(this).remove();
        });

        markGroup(shSelect.find('option:contains("Klacz")').toArray(), ColorArrMare);
        markGroup(shSelect.find('option:contains("Ogier")').toArray(), ColorArrStall);
    });

    $('#remove-btn').click(() => {
        enableBtn(shSelect.find(':selected').length);
        shSelect.find(':selected').each(function(){

            $this = $(this);
            ahSelect.append('<option value="' + $this.val() + '">'+ $this.text().substring(2, $this.text().length) + '</option>');
            $this.remove();
        });

        sortSHSelect();
        markGroup(shSelect.find('option:contains("Klacz")').toArray(), ColorArrMare);
        markGroup(shSelect.find('option:contains("Ogier")').toArray(), ColorArrStall);
    });

    $('#move-up').click(() => { 
        enableBtn(shSelect.find(':selected').length);
        shSelect.find(':selected').each(function(){
            $this = $(this);
            $this.prev().before($this);
        });
        sortSHSelect();

        markGroup(shSelect.find('option:contains("Klacz")').toArray(), ColorArrMare);
        markGroup(shSelect.find('option:contains("Ogier")').toArray(), ColorArrStall);
    });

    $('#move-down').click(() => { 
        enableBtn(shSelect.find(':selected').length);
        $(shSelect.find(':selected').get().reverse()).each(function() {
            $this = $(this);
            $this.next().after($this);
        });
        sortSHSelect();

        markGroup(shSelect.find('option:contains("Klacz")').toArray(), ColorArrMare);
        markGroup(shSelect.find('option:contains("Ogier")').toArray(), ColorArrStall);
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
                    ahSelect.append(option.clone().css({'background-color' : 'transparent'}));
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