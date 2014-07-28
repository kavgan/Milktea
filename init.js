var exec = require('child_process').exec,
    nginx_proxy = require('./nginx_proxy.js'),
    Q = require('q');


module.exports = function init(){
    //pull nginx docker image
    //start nginx docker image
    //should restart if already started
    nginx_proxy.status().then( function(status){
        console.log(status);

        switch(status){
            case 0: nginx_proxy.create_mount_dir()
                .then( nginx_proxy.get_image ).fail(handle_fail)
                .then( nginx_proxy.start_image )
                break;
            case 1: nginx_proxy.start_image(); break;
            case 2: nginx_proxy.start_process(); break;
            case 3: nginx_proxy.restart(); break;
            defaut: console.log('invalid status returned');
        }


    });

    /*get_image(nginx_name)
        .then(start_nginx)
        .fail( function(msg){
            console.log('som ting wong:',msg);
        }).done(function(res){
            console.log('wtf',res);
        });*/
}
function handle_fail(msg){
    console.log(msg);
}