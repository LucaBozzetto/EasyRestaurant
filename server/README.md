# EasyRestaurant's Backend

## Introduction
This is the EasyRestaurant's backend.\
The server has been realized using NodeJS, Express and MongoDB.\
It can uses a local or remote database and by default it will connect to mLab's one.



## Scripts
There are a few scripts you can use in order to setup and run the server.\
Append the following commands to `npm run`:\

1.  __dev:__ Run the server using nodemon. This is useful and recommended only while developing.
2. __start-local:__ Run the server connecting to a local server. The address of the local server has to be localhost:27017/easyrestaurant
3. __start-db:__ Creates a `data` folder used to store the database and runs the mongodb deamon.
4. __populate_db:__ Populates the local database with a bunch of users, items and others. This is useful if you wish to test the local server's api.

## Endpoints
For a complete list and documentation of the endpoints please refer to the [APIs documentation](https://documenter.getpostman.com/view/6803722/SVYxnF9P).\
Getting the base path will return a list of all endpoints as well.

