
/* jshint esnext: true, jquery: true*/
let buttonEdit = '<button type="button" data-toggle="modal" data-target="#update-modal" class="glyphicon glyphicon-edit btn-success update-row"         aria-hidden="true"></button>',
    buttonDelete = '<button type="button" data-toggle="modal" data-target="#delete-modal" class="glyphicon glyphicon-remove btn-danger remove-row" aria-hidden="true"></button>';

let showIfError = (response)=>
{
    $('#info-modal-text').text('Error! ' + response.message);
    $('#info-modal').modal('show');
};


let resizeTable = (table) => {

    let tCells = table.find('tbody tr').first().children(),
        thChlds = table.find('thead tr');

    let colWidth = tCells.map(function() {
        return $(this).width();
    }).get();

    thChlds.first().children().each(function(i, v) {
        $(v).width(colWidth[i]);
    });   
    thChlds.last().children().each(function(i, v) {
        $(v).width(colWidth[i]);
    });   

};
let makeRowsInTable = (listOfObject, $tbody) =>
{
    listOfObject.forEach((elem) => {

        createRow(elem, $tbody);
    });
};

let createRow = (object, $tbody, addBtns) => {

    let $tr = $('<tr>').appendTo($tbody);

    if(addBtns || addBtns === undefined){
        object.buttonEdit = buttonEdit;
        object.buttonDelete = buttonDelete;
    }

    for(let key in object){

        if(key !== '__v')
            createCol(object[key], $tr);
    }

    return $tr;

};

let createCol = (value, $tr) => {
    let $th = $('<td>').appendTo($tr);
    if(isObject(value)){

        $th.attr('data-value', value[Object.keys(value)[0]]);
        $th.append(createTextToOptionSelect(value));
    }
    else {

        $th.append(value);
    }

};
let updateRow = (object, $tr) => {


    $tr.children().remove();

    object.buttonEdit = buttonEdit;
    object.buttonDelete = buttonDelete;

    for(let key in object){

        if(key !== '__v')
            createCol(object[key], $tr);
    }

};

let createTextToOptionSelect = (object) => {
    var text = "ID: " + object[Object.keys(object)[0]];

    if(object.hasOwnProperty('idAuthor') || object.hasOwnProperty('idReader'))
    {
        text += ", " + object.name + " " + object.surname;
    }
    else if(object.hasOwnProperty('idBook'))
    {
        text += ", " + object.title;
    }

    return text;
};

let createOptionSelect = ($select, listObjects) => {
    var $option,
        object;

    for(let i in listObjects){

        $option = $('<option>').appendTo($select);
        object = listObjects[i];
        $option.text(createTextToOptionSelect(listObjects[i]));
        $option.attr('value', object[Object.keys(object)[0]]);
    }

};




let isObject = (val) => {
    if (val === null)
    {
        return false;
    }
    return ( (typeof val === 'function') || (typeof val === 'object') );
};

let isValidDate = (dateString) => {
    // First check for the pattern
    var regex_date = /^\d{4}\-\d{1,2}\-\d{1,2}$/;

    if(!regex_date.test(dateString))
    {
        return false;
    }

    // Parse the date parts to integers
    var parts   = dateString.split("-");
    var day     = parseInt(parts[2], 10);
    var month   = parseInt(parts[1], 10);
    var year    = parseInt(parts[0], 10);

    // Check the ranges of month and year
    if(year < 1000 || year > 3000 || month === 0 || month > 12)
    {
        return false;
    }

    var monthLength = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];

    // Adjust for leap years
    if(year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
    {
        monthLength[1] = 29;
    }

    // Check the range of the day
    return day > 0 && day <= monthLength[month - 1];
};