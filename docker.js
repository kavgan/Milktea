var Q = require('q'),
    exec = require('child_process').exec;

var docker = function(){
    this.run = function(options){
        return Q.promise( function(resolve,reject,notify){
            var cmd = 'nohup docker run ' + options + ' &';
            console.log(cmd);
            exec(cmd, function(err, stout,sterr){
                if(!err){
                    resolve('cmd successful: ' + cmd);
                }else{
                    console.log(stout);
                }
            });
        })
    }


    this.start_image = function(img_name,name){
        if(!name){ name=img_name; }
        name = name.replace('/','_');
        console.log('starting image: ' + img_name + ',' + name);



        return Q.promise( function(resolve,reject,notify){
            var cmd = 'nohup docker run --name=' + name + ' -i -t ' + img_name + ' /bin/bash &';
            console.log(cmd);

            exec(cmd, function(err, stout,sterr){
                if(!err){
                    resolve('nginx started');
                }else{
                    console.log(stout);
                }
            });
        })
    }

    this.start_process = function(name){
        name = name.replace('/','_');
        console.log('starting process: ' + name);

        return Q.promise( function(resolve,reject,notify){
            var cmd = 'docker start ' + name;
            console.log(cmd);

            exec(cmd, function(err, stout,sterr){
                if(err){
                    return reject();
                }
                console.log('started: ' + name);
                resolve();
            });
        })
    }

    this.stop_process = function(name){
        name = name.replace('/','_');
        console.log('stopping process: ' + name);

        return Q.promise( function(resolve,reject,notify){
            var cmd = 'docker stop ' + name;
            console.log(cmd);

            exec(cmd, function(err, stout,sterr){
                if(!err){
                    console.log(stout,sterr);
                    resolve('stopped: ' + name);
                }
            });
        })
    }

    this.pull_image = function(img_name){
        console.log('pulling image: ' + img_name + ':latest');
        return Q.promise( function(resolve, reject, notify){
            var cmd = 'docker pull ' + img_name + ':latest';
            console.log(cmd);
            exec(cmd, function(err, stout, sterr){
                if(err){
                    reject(err);
                }else{
                    resolve(img_name);
                }
            });
        });
    }

    this.port = function(name){
        return Q.promise( function(resolve,reject,notify){
            var cmd = 'docker port ' + name + ' 80';

            exec(cmd, function(err, stout, sterr){
                if(err){
                    return reject(err);
                }
                resolve(stout.split(':')[1].trim());
            });
        });
    }

    this.image_exists = function(img_name){
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

    this.process_started = function(img_name){
        img_name = img_name.replace('/','_');
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
                            if(columns[columns.length-1] == img_name || columns[columns.length-2] == img_name){
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
}

var dock = new docker();

module.exports = dock;