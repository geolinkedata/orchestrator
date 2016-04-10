Orchestrator
============

node.js server app that handles middleware operations to route requests to Geonode, and semantic db.

## Requirements
It requires Virtuoso or Strabon and GeoNode in the back-end.

## Installation on Ubuntu

### Virtuoso

You must build Virtuoso from sources because ubuntu package is an old version. Read `full instructions
<http://virtuoso.openlinksw.com/dataspace/doc/dav/wiki/Main/VOSUbuntuNotes>`_ or:

```

    sudo apt-get update
    sudo apt-get install git
    sudo aptitude install dpkg-dev build-essential
    sudo apt-get install autoconf automake libtool flex bison gperf gawk m4 make odbcinst libxml2-dev \
     libssl-dev libreadline-dev
    
    mkdir /home/vagrant/C
    cd /home/vagrant/C
    git clone git://github.com/openlink/virtuoso-opensource.git
    cd virtuoso-opensource
    ./autogen.sh
    ./configure --prefix=/usr/local/ --with-readline --program-transform-name="s/isql/isql-v/" \ 
    --enable-ods-vad --enable-tutorial-vad --enable-sparqldemo-vad
    
    make -j5
    sudo make install
```

Virtuoso is installed in **/usr/local/var/lib/virtuoso/**

Start it with:

```
   
    cd /usr/local/var/lib/virtuoso/db
    virtuoso-t -fd &

```

### Node.js 

Install Node.js with: 

```
apt-add-repository ppa:chris-lea/node.js
apt-get update
apt-get install nodejs

```

## Orchestrator

### Clone the repo
```
cd some_dir
git clone https://github.com/geolinkedata/orchestrator.git orchestrator
cd orchestrator

```

### Dependencies
```
npm install
```
note: virtuoso-isql-wrapper depends by coffee-script but recent versions are unsupported,
so reinstall virtuoso-isql-wrapper dependency:

```
cd some_dir/node_modules/virtuoso-isql-wrapper
rm -R node_modules/coffee-script
```
edit some_dir/node_modules/virtuoso-isql-wrapper/package.json and substitute
```   
  "dependencies": {
    "coffee-script": ">= 1.1.2"
  },
```  
with:

```   
  "dependencies": {
    "coffee-script": "= 1.1.2"
  },
```  
and then reinstall module dependency:
```
npm install
```

install bootleaf:
```
cd some_dir/public/
git clone https://github.com/pcasciano/bootleaf.git
```

### Configure the server
modify values in **config.json**


### Run tests
```
make test
```
or
```
npm test
```



## Running the server
```
node server.js
```
