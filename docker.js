var Q = require('q'),
    exec = require('child_process').exec;

var docker = function(){
    this.start_image = function(img_name){
        console.log('starting image: ' + img_name);

        return Q.promise( function(resolve,reject,notify){
            var cmd = 'nohup docker run -p 80:80 --name=' + img_name + ' -i -t ' + img_name + ' /bin/bash &';
            console.log(cmd);

            exec(cmd, function(err, stout,sterr){
                if(!err){
                    resolve('nginx started');
                }
            });
        })
    }

    this.start_process = function(name){
        console.log('starting process: ' + name);

        return Q.promise( function(resolve,reject,notify){
            var cmd = 'docker start ' + name;
            console.log(cmd);

            exec(cmd, function(err, stout,sterr){
                console.log(err);
                if(!err){
                    resolve('nginx started');
                }
            });
        })
    }

    this.stop_process = function(name){
        console.log('stopping process: ' + name);

        return Q.promise( function(resolve,reject,notify){
            var cmd = 'docker stop ' + name;
            console.log(cmd);

            exec(cmd, function(err, stout,sterr){
                console.log('wtf');
                console.log(err);
                if(!err){
                    console.log(stout,sterr);
                    resolve('nginx stopped');
                }
            });
        })
    }

    this.pull_image = function(img_name){
        console.log('pulling image: ' + img_name + ':latest');
        return Q.promise( function(resolve, reject, notify){
            exec('docker pull ' + img_name + ':latest', function(err, stout, sterr){
                if(err){
                    reject(err);
                }else{
                    resolve(img_name);
                }
            });
        });
    }
}

var dock = new docker();

module.exports = dock;