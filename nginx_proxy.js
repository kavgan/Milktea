var exec = require('child_process').exec,
    Q = require('q'),
    docker = require('./docker'),
    handlebars = require('handlebars'),
    fs = require('fs');

var nginx_img_name = 'milktea/nginx'
var nginx_img_name = 'uptownhr/nginx'

var nginx_name = 'proxy';

var proxy_path = '/tmp/milktea/proxy';

var nginx_proxy = function nginx_proxy(){
    var self = this;
    this.add_domain = function(domain,port){
        console.log('adding domain');

        return Q.promise(function(resolve,reject,notify){
            read_template().then( function(handlebar){
                console.log('then test');
                var template = handlebars.compile(handlebar);
                var string = template( {domain:domain,name:domain.split('.')[0],port:port} )
                console.log(string);

                //write string to proxy/default
                fs.writeFile(proxy_path + '/' + domain, string, function(err){
                    if(err){
                        return reject(err);
                    }
                    console.log('proxy vhost generated');
                    resolve('zzzzz');
                });


            }).fail( reject );
        });
    }

    this.start_image = function(){
        console.log('starting nginx proxy image');
        return docker.run('-p 80:80 -p 443:443 -v ' + proxy_path + ':/etc/nginx/sites-enabled --name=' + nginx_name + ' -i -t ' + nginx_img_name + ' /bin/bash');
        //return docker.start_image(nginx_name);
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
        return docker.pull_image(nginx_img_name);
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
            docker.process_started(nginx_name)
                .then(resolve).fail( function(){
                    return docker.image_exists(nginx_img_name);
                })
                .then(resolve);
        });
    }

    this.init = function(){
        self.status().then( function(status){
            /*
             0 - image does not exist
             1 - image exist
             2 - process name exist
             3 - process started
             */
            switch(status){
                case 0:
                    self.get_image().fail(console.log)
                    .then( self.start_image).then(console.log);
                    break;
                case 1: self.start_image(); break;
                case 2: self.start_process(); break;
                case 3: self.restart(); break;
                    defaut: console.log('invalid status returned');
            }
        });
    }
}


var proxy = new nginx_proxy();

module.exports = proxy;

function read_template(){
    console.log('reading template');
    return Q.promise( function(resolve,reject,notify){
        fs.readFile('templates/proxy.conf', function(err, data){
            if(err){ return reject(err); }
            return resolve(data.toString());
        });
    })
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
                console.log('directory found: ' + dir_path);
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