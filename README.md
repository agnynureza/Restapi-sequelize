# BambuLife API

## add Features!
  - Caching with Redis

### Installation
With npm:

```
$npm install
$npm start
```
for testing :
```
$npm test
```
 
### REST API 
#### routes :
| Route          | HTTP   |            Description              |
|----------------|--------|-------------------------------------|
| `/people-like-you`| GET    | Sign in Account                 |

just hit endpoint  ```http://postgres-server.agnynureza.online/people-like-you?age=20?experienced=true``` (optional query parameter)

Access API via ```http://localhost:3000``` or ```http://postgres-server.agnynureza.online```

### Basic usage:
you can use postman or insomnia for API testing :

1. GET ```/people-like-you``` 

Params:

| Key | Value | info   |
| ---- | ------ | ------- |
| age| 20 | optional |
| longitude | 43.23 | optional |
| latitude | 34.432 | optional |
| monthlyIncome| 4352 | optional |
| experienced | true | optional |


### Tech
* [node.js] - evented I/O for the backend
* [Express] - fast node.js network app framework
* [Postgres] - the streaming build system
* [Mocha] - test run
* [Sequelize] - Object Data Modeling (ODM) library for MongoDB and Node.js
* [Redis] - Session Cache
* [Google Cloud Platform] - deployment


[node.js]: <http://nodejs.org>
[Mocha]: <https://mochajs.org/>
[Postgres]: <https://www.postgresql.org/>
[Sequelize]:<http://docs.sequelizejs.com/>
[Express]: <http://expressjs.com>
[Redis]: <https://redis.io/>
[Google Cloud Platform]: <https://cloud.google.com/>

