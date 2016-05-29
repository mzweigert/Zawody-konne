/*jshint node: true, esnext: true, jquery:true  */
$(() => {
    $('#login-btn').click(() => {

        let $username = $('#username').val(),
            $password = $('#password').val(),
            $alert    = $('#login-alert');

        $alert.removeClass('in');
        $alert.text('');
        $.ajax({
            
            type: "POST",
            url: './login',
            data: JSON.stringify({ username: $username, password: $password }),
            
            contentType: "application/json"
               
        }).success((res) => {
            window.location = res;
        }).error((err) => {
            
            $alert.addClass('in');
            $alert.text(err.responseText);
        });

    });
});