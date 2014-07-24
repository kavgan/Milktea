var exec = require('child_process').exec;
var Q = require('q');

var nginx_name = 'milktea/nginx';
var nginx_name = 'ubuntu';

module.exports = function init(){
    //pull nginx docker image
    //start nginx docker image
    //should restart if already started

    get_image(nginx_name)
        .then(start_nginx)
        .fail( function(msg){
            console.log('som ting wong:',msg);
        }).done(function(res){
            console.log('wtf',res);
        });
}

function get_image(img_name){
    return Q.promise(function(resolve, reject, notify){
        image_exists(img_name)
            .then(resolve)
            .fail( docker_pull )
            .then( resolve ).fail( function(msg){
                reject(msg);
            });
    });
}

function image_exists(img_name){
    return Q.promise( function(resolve, reject, notify){
        //list docker images
        exec('docker images', function(err, stout, sterr){
            var found = false;
            stout.split("\n").forEach( function(v,k){
                var split = v.split(" ");

                var columns = [];
                split.forEach( function(v){
                    if(v != ''){
                        columns.push(v.trim());
                    }
                });

                if( columns[0] == img_name ){
                    found = true;
                }
            });

            if(found){
                console.log('found: ', img_name);
                resolve(img_name);
            }else{
                console.log('image not found:', img_name);
                reject(img_name);
            }
        });
    });
}

function docker_pull(img_name){
    return Q.promise( function(resolve, reject, notify){
        exec('docker pull ' + img_name, function(err, stout, sterr){
            console.log(stout);
            if(err){
                reject(err);
            }else{
                resolve(img_name);
            }
        });
    });
}

function start_nginx(img_name){
    return Q.promise( function(resolve, reject, notify){
        process_started(img_name)
            .then(reject)
            .fail(function(){
                var cmd = 'nohup docker run -p 80:80 --name=' + img_name + ' -i -t ' + img_name + ' /bin/bash &';
                console.log(cmd);
                exec(cmd, function(err, stout,sterr){
                    if(!err){
                        console.log(stout,sterr);
                        resolve('nginx started');
                    }
                })
            })
    });
}

function process_started(img_name){
    return Q.promise( function(resolve,reject,notify){
        exec('docker ps', function(err, stout,sterr){
            if(err){
                throw err
            }else{
                var lines = stout.split("\n");
                if(lines.length>1){
                    var found = false;
                    lines.forEach(function(v,k){
                        var split = v.split('  ');
                        var columns = [];

                        split.forEach(function(v){
                            if(v != ''){
                                columns.push(v.trim());
                            }
                        })

                        if(columns[5] == img_name){
                            found = true;
                        }
                    });

                    if(found){
                        resolve('already started');
                    }else{
                        reject();
                    }
                }else{
                    console.log('ps not found',lines);
                    reject();
                }
            }
        });
    });
}