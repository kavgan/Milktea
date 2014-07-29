var Q = require('q'),
    docker = require('./docker.js');;

var nginx_lemp_name = 'nginx_lemp_name';
var nginx_lemp_name = 'ubuntu';


var Instance = function instance(domain){
    this.domain = domain;

    this.start_image = function(){
        console.log('starting image: ' + domain);
        return docker.start_image(nginx_lemp_name,domain);
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
        console.log('pulling image: ' + nginx_lemp_name);
        return docker.pull_image(nginx_lemp_name);
    }

    this.getStatus = function(){
        if(!domain){ domain = this.domain; }
        if(!domain){ throw 'domain not set'; }

        return Q.promise(function(resolve,reject,notify){
            docker.process_started(domain)
                .then(resolve)
                .fail( function(){
                    return docker.image_exists(nginx_lemp_name)
                })
                .then(resolve);
        });
    }
}

module.exports = Instance;