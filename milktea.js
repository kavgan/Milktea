var exec = require('child_process').exec,
    nginx_proxy = require('./nginx_proxy.js'),
    instance = require('./instance.js'),
    Q = require('q');

var milktea_dir = '/tmp/milktea';
var proxy_path = milktea_dir + '/proxy';

module.exports = {
    init: function(){
        create_directory(milktea_dir)
            .then( create_directory(proxy_path) )
            .then( nginx_proxy.init ).fail(console.log);

        //pull nginx docker image
        //start nginx docker image
        //should restart if already started


    },
    start: function(domain){
        var container = new instance(domain);
        container.init()
            .then( container.get_port)
            .then( function(port){
                nginx_proxy.add_domain(domain,port)
                    .then(nginx_proxy.init);
            }).fail( console.log );

    },
    stop: function(domain){
        var container = new instance(domain);
        container.get_status().then( function(status){
            if(status != 3){
                return console.log('process not started: ' + domain);
            }
            container.stop_process().then(console.log);
        });
    },
    ssh: function(){

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