# EasyRestaurant
A fullstack application that makes running a restaurant easier (or at least it's supposed to!).

![screenshot](https://user-images.githubusercontent.com/2963072/65913230-cf781680-e3cf-11e9-8327-8bd6c9d61072.png)

This project was made for the [Web Technologies and Applications](http://www.dsi.unive.it/~bergamasco/teaching.html) course @[Ca'Foscari](https://www.unive.it/) University of Venice.\
An online version of the application is [available here](https://easyrestaurant-frontend.herokuapp.com/).\
The backend has been made using NodeJS, MongoDB, Express, SocketIO and PassportJS.\
The frontend is based on Angular 8 and has been encapsulated for mobile and desktop using Cordova and Electron.



## Installation
`npm install` should simply do all the dirty work for you. If you wish to only install the dependecies for the backend or the frontend you can run the following scripts:

```
npm run install-server
npm run install-web
npm run install-mobile
npm run install-desktop
```



## Mobile and Desktop
Building for mobile and desktop has additional requirements (eg. Android SDK for Android applications).
The following commands, will fail if you don't have the necessary packages installed:

```
npm run generate-android
npm run generate-desktop
```

The generated apps will be availabe in the `/releases` folder.\
Additionally these scripts require you to have built an android and desktop versione of the app. You can do so running:

```
npm run build-mobile
npm run build-desktop
```


## Local version
The android, desktop and even the web app are connecting to a [remote backend](https://easyrestaurant-backend.herokuapp.com/) hosted on heroku.\
If you wish to connect to a local backend just run `npm run start-web-local`.\
Please mind you need to have a local server running.

First of all run `npm run start-db` to run a mongodb deamon for your database.\
Then from another tab run `npm run start-server-local` to start a server which will connect to your newly created mongodb database.\
You can also run `npm run populate-db` to populate the local database with a bunch of users, items and others to start right away.
