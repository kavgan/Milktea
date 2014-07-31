#Simple webhosting management CLI tool
Milktea uses nginx and docker containers to spawn web servers.

```
  Usage: milk [options] [command]

  Commands:

    init [options] 
       initialize milktea
    
    start <domain>
       start a domain
    
    stop <domain>
       stop a domain
    
    list 
       list domains
    
    delete <domain>
       delete a domain
    
    backup <domain>
       backup domain
    
    ssh <domain>
       ssh into a domain
    

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
```
