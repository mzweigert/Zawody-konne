/* jshint esnext: true, jquery:true */
$(()=>{
    'use strict';
    let comps = $('#competitions'),
        groups = $('#groups'),
        groupsJumbo = $('#groups-jumbo');


    $(window).resize(function() {
        resizeTable(comps.parent());
    }).resize();
    window.setTimeout(() => resizeTable(comps.parent()), 50);

    comps.click((e) => {

        let $this = $(e.target).parent(),
            compId = $this.attr('data-value');

        if(!compId || compId === groupsJumbo.attr('data-comp'))
            return;


        comps.children().css({'background-color': 'transparent'});
        $this.css({'background-color': 'aqua'});
        resizeTable(comps.parent());

        groupsJumbo.attr('data-comp', compId);
        groupsJumbo.hide('slide', {direction: 'right'}, 250, () => {



            $.get('./getCompGroups/' + compId, (res) => {

                groups.children().remove();


                res.groups.forEach((group) => {

                    let obj = {
                        name: group.name,
                        gedner: group.gender,
                        nHorses: group.horses.length
                    },
                        $tr = createRow(obj, groups, false); 

                    group.horses.forEach((horse) => {
                        if(horse._id === res.currentVoteHorse){
                            $tr.css({'background-color': 'red'});
                        } 
                    });

                    $tr.attr('id', group._id);

                });
                resizeTable(groups.parent());

                groupsJumbo.show('slide', {direction: 'left'}, 250, () => {
                    resizeTable(comps.parent());
                });
            });

        });
    });

    groups.click((e) => {
        let $this = $(e.target).parent().attr('id');
        if(!$this)
            return;
        
        window.location.href = './group/' + $this;
    });
});