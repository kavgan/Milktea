var exec = require('child_process').exec,
    Q = require('q'),
    docker = require('./docker');

var nginx_name = 'milktea/nginx';
var nginx_name = 'ubuntu';

var nginx_proxy = function nginx_proxy(){


    this.start_image = function(){
        console.log('starting nginx proxy image');
        return docker.start_image(nginx_name);
    }

    this.start_process = function(){
        console.log('starting nginx proxy process');
        return docker.start_process(nginx_name)
    }

    this.stop_process = function(){
        console.log('stopping nginx proxy');
        return docker.stop_process(nginx_name);
    }

    this.restart = function(){
        console.log('restarting nginx proxy');
        return this.stop_process()
            .then( this.start_process );
    }

    //pulls nginx_proxy image
    this.get_image = function(){
        console.log('pulling nginx_proxy image');
        return docker.pull_image(nginx_name);
    }

    //creates mountable directory
    this.create_mount_dir = function(){
        console.log('creating mountable proxy directory');

        return Q.promise( function(resolve, reject, notify){
            return check_directory()
                .then( resolve ).fail( create_directory)
                .then( resolve ).fail( function(msg){
                    console.log(msg);
                })
        });
    }

    /*
    0 - image does not exist
    1 - image exist
    2 - process name exist
    3 - process started
     */
    this.status = function(){
        console.log('getting nginx proxy status');
        return Q.promise(function(resolve,reject,notify){
            process_started(nginx_name)
                .then(resolve).fail(image_exists)
                .then(resolve);
        });
    }
}


var proxy = new nginx_proxy();

module.exports = proxy;

function check_directory(){
    console.log('checking for directory');

    return Q.promise( function(resolve,reject,notify){
        var cmd = 'touch /tmp/milktea/test';
        exec(cmd, function(err,stout,sterr){
            if(err){
                return reject();
            }else{
                return resolve();
            }
        })
    });
}

function create_directory(){
    console.log('creating directory');

    return Q.promise( function(resolve,reject,notify){
        var cmd = 'mkdir /tmp/milktea';
        exec(cmd, function(err,stout,sterr){
            if(err){
                console.log('error creating directory');
                reject();
            }else{
                console.log('directory created');
                resolve();
            }
        })
    })
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
                resolve(1);
            }else{
                console.log('image not found:', img_name);
                resolve(0);
            }
        });
    });
}

function process_started(img_name){
    console.log('checking process name:', img_name);
    return Q.promise( function(resolve,reject,notify){
        exec('docker ps -a', function(err, stout,sterr){
            if(err){
                throw err
            }else{
                var lines = stout.split("\n");

                if(lines.length>2){
                    var found = false;
                    var started = false;
                    lines.forEach(function(v,k){
                        var split = v.split('  ');
                        var columns = [];

                        split.forEach(function(v){
                            if(v != ''){
                                columns.push(v.trim());
                            }
                        })

                        //check if img name has already been created
                        if(columns[6] == img_name || columns[5] == img_name){
                            found = true;
                            //check if already started
                            if( columns[4].search('Exit') == -1 ){
                                started = true;
                            }
                        }
                    });

                    if(started){
                        resolve(3);
                    }else if(found){
                        resolve(2);
                    }else{
                        reject(img_name);
                    }
                }else{
                    reject(img_name);
                }
            }
        });
    });
}