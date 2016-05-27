/*jshint node: true, esnext: true, jquery:true  */
$(() => {
    $('#loginBtn').click(() => {
        let $username = $('#username').val(),
            $password = $('#password').val(),
            $alert    = $('#login-alert');
        
        $.post('/', { username: $username, password: $password}, (res) => {
            console.log(res);
        });
    });
});