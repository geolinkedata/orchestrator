oaks_node
=========

node.js server app that handles loading requests in semantic db.

## Requirements
It requires node.js v0.10.20 at least.

```
apt-add-repository ppa:chris-lea/node.js
apt-get update
apt-get install nodejs

```

## Installation

### Grab a copy of the repo
```
cd some_dir
git clone https://github.com/pcasciano/oaks_node.git oaks_node
cd oaks_node

```

### fetch all the oaks_node dependencies
```
npm install
```

### configure server
modify values in **config.json**


### run tests
```
make test
```
or
```
npm test
```



## Running server
```
node server.js
```
