var Q = require('q'),
    docker = require('./docker.js'),
    exec = require('child_process').exec,
    handlebars = require('handlebars'),
    fs = require('fs');

var nginx_lemp_img_name = 'uptownhr/nginx-php-fpm';
var milktea_path = '/tmp/milktea/';

var Instance = function instance(domain){
    var self = this;
    this.domain = domain;
    this.project_dir = milktea_path + domain;
    this.project_vhost = this.project_dir + '/vhost';
    this.project_app = this.project_dir + '/app';
    this.project_doc_root = this.project_app + '/public';


    this.start_image = function(){
        console.log('starting image: ' + domain);

        //create vhost directory
        //create docroot directory
        return docker.run('-p 80 -p 443 -v ' + self.project_vhost + ':/etc/nginx/sites-enabled -v ' + self.project_dir + ':/var/www --name=' + domain + ' -i -t ' + nginx_lemp_img_name + ' /bin/bash');
        //return docker.run('-p 80 -p 443 -v ' + self.project_vhost + ':/etc/nginx/sites-enabled -v ' + self.project_dir + ':/var/www --name=' + domain + ' -i -t ' + nginx_lemp_img_name + ' /sbin/my_init --enable-insecure-key');
        //return docker.start_image(nginx_lemp_name,domain);
    }

    this.start_process = function(){
        console.log('starting process: ' + domain);
        return docker.start_process(domain)
    }

    this.stop_process = function(){
        console.log('stopping process: ' + domain);
        return docker.stop_process(domain);
    }

    this.restart = function(){
        console.log('restarting process: ' + domain);
        return this.stop_process()
            .then( this.start_process );
    }

    this.get_image = function(){
        console.log('pulling image: ' + nginx_lemp_img_name);
        return docker.pull_image(nginx_lemp_img_name);
    }

    this.get_port = function(){
        console.log('getting port: ' + domain);
        return docker.port(domain);
    }

    this.get_status = function(){
        if(!domain){ throw 'domain not set'; }

        return Q.promise(function(resolve,reject,notify){
            docker.process_started(domain)
                .then(resolve)
                .fail( function(){
                    return docker.image_exists(nginx_lemp_img_name)
                })
                .then(resolve);
        });
    }

    this.create_directories = function(){
        return Q.promise(function(resolve,reject,notify){
            create_directory(self.project_dir)
                .then( function(){
                    return create_directory(self.project_vhost);
                }).then( function(){
                    return create_directory(self.project_app);
                }).then( function(){
                    return create_directory(self.project_doc_root);
                }).fail( function(msg){
                    reject()
                }).done( function(){
                    resolve();
                })
        });
    }

    this.generate_sample_index = function(){
        return Q.promise( function(resolve, reject, notify){
            read_template('sample.html').then( function(html){
                var template = handlebars.compile(html);
                var string = template( {domain:self.domain} )
                //write string to vhost/default
                console.log(string);
                fs.writeFile(self.project_doc_root + '/index.html', string, function(err){
                    if(err){
                        return reject(err);
                    }
                    console.log('sample generated');
                    resolve();
                });
            })
        })
    }

    this.generate_vhost = function(){
        return Q.promise( function(resolve, reject, notify){
            read_template('instance.conf').then( function(conf){
                var template = handlebars.compile(conf);
                var string = template( {domain:self.domain} )
                //write string to vhost/default
                fs.writeFile(self.project_vhost + '/default', string, function(err){
                    if(err){
                        return reject(err);
                    }
                    console.log('vhost generated');
                    resolve();
                });
            })
        })
    }


    this.init = function(){

        return Q.promise( function(resolve,reject,notify){
            self.create_directories()

                .then(self.get_status)
                .then( function(status){
                        switch(status){
                            case 0:
                                console.log('New Init');
                                return self.get_image()
                                    .then(self.generate_vhost)
                                    .then(self.generate_sample_index)
                                    .then( self.start_image)
                                    .then( resolve );
                                break;
                            case 1:
                                console.log('Image exists, starting image');
                                return self.generate_vhost()
                                    .then(self.generate_sample_index)
                                    .then(self.start_image)
                                    .then(resolve);
                                break;
                            case 2:
                                console.log('Process exists, starting process');
                                return self.start_process().then(resolve);
                                break;
                            case 3:
                                console.log('process already started: ' + domain);
                                reject();
                                break;
                            default:
                                console.log('bad status: ' + domain)
                                reject();
                        }
                    })
                .fail( function(msg){
                    console.log(msg);
                    reject();
                })
        })
    }
}

module.exports = Instance;



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

function read_template(file){
    console.log('reading template');
    return Q.promise( function(resolve,reject,notify){
        fs.readFile('templates/' + file, function(err, data){
            if(err){ return reject(err); }
            return resolve(data.toString());
        });
    })
}