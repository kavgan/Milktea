var exec = require('child_process').exec,
    nginx_proxy = require('./nginx_proxy.js'),
    instance = require('./instance.js'),
    Q = require('q');

var milktea_dir = '/tmp/milktea';


module.exports = {
    init: function(){
        create_directory(milktea_dir)
            .then( nginx_proxy.init ).fail(console.log);

        //pull nginx docker image
        //start nginx docker image
        //should restart if already started


    },
    start: function(domain){
        var container = new instance(domain);

        /*
         0 - image does not exist
         1 - image exist
         2 - process name exist
         3 - process started
         */
        container.getStatus().then( function(status){

            switch(status){
                case 0:
                    container.get_image();
                    break;
                case 1:
                    container.start_image();
                    break;
                case 2:
                    container.start_process();
                    break;
                case 3:
                    console.log('process already started: ' + domain);
                default:
                    console.log('')
            }
        })
    }
}

function check_directory(dir_path){
    console.log('checking for directory');

    return Q.promise( function(resolve,reject,notify){
        var cmd = 'touch ' + dir_path + '/test';
        exec(cmd, function(err,stout,sterr){

            if(err){
                console.log('err',err);
                return reject(dir_path);
            }else{
                console.log('pass');
                return resolve();
            }
        })
    });
}

function create_directory(dir_path){
    console.log('creating directory');

    return Q.Promise(function(resolve,reject,notify){
        check_directory(dir_path).then( function(){
            resolve();
        }).fail(function(){
            var cmd = 'mkdir ' + dir_path;
            exec(cmd, function(err,stout,sterr){
                if(err){
                    console.log('error creating directory',err);
                    reject();
                }else{
                    console.log('directory created');
                    resolve();
                }
            })
        })
    })
}