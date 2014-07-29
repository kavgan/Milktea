var exec = require('child_process').exec,
    Q = require('q'),
    docker = require('./docker'),
    handlebars = require('handlebars'),
    fs = require('fs');

var nginx_img_name = 'milktea/nginx'
var nginx_img_name = 'uptownhr/nginx'

var nginx_name = 'milktea_nginx';
var nginx_name = 'uptownhr_nginx';

var nginx_proxy = function nginx_proxy(){
    var self = this;
    this.add_domain = function(domain){
        console.log('adding domain');

        read_template().then( function(handlebar){
            var template = handlebars.compile(handlebar);
            var string = template( {test:'tumadre'} )
            console.log(string);

        }).fail( console.log );
    }

    this.start_image = function(){
        console.log('starting nginx proxy image');
        return docker.run('-p 80:80 -p 443:443 --name=' + nginx_name + ' -i -t ' + nginx_img_name + ' /bin/bash');
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
                case 0: self.create_mount_dir()
                    .then( self.get_image ).fail(console.log)
                    .then( self.start_image )
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
        fs.readFile('nginx_proxy/template.js', function(err, data){
            if(err){ return reject(err); }
            return resolve(data.toString());
        });
    })
}
