#!/usr/bin/env node

/**
 * Module dependencies.
 */

var program = require('commander');
var init = require('./init.js');
//init();
program.version('0.0.1');



program.command('init')
    .description('initialize milktea')
    .option('-r, --restart','restart milktea')
    .option('-res, --res [value]','testing')
    .action( function(options){
        init();
    });

program.command('start <domain>')
    .description('start a domain')
    .action( function(domain){
        console.log('starting ... ',domain);
    });

program.command('stop <domain>')
    .description('stop a domain')
    .action( function(domain){
        console.log('stoping ... ',domain);
    });

program.command('list')
    .description('list domains')
    .action( function(){
        console.log('listing domains...');
    });

program.command('delete <domain>')
    .description('delete a domain')
    .action( function(domain){
        console.log('deleting domain ... ',domain);
    });

program.command('backup <domain>')
    .description('backup domain')
    .action( function(domain){
        console.log(domain);
    });

program.command('ssh <domain>')
    .description('ssh into a domain')
    .action( function(domain){
        console.log(domain);
    });

program.parse(process.argv);

if(process.argv.length == 2){
    program.help();
}