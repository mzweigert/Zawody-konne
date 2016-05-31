/* jshint esnext: true, jquery: true*/
$(() => {
    let hCount = $('#horse-count');
    
    $.get('../../horse/getAllHorses', (res) => {
        hCount.attr('max', res.length);
    });
});