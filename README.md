# SeattleMealTrain

A Food Delivery website, for CS5500 Foundations of Software Engineering Project, from Team BugFreeArmy.

Website: https://bugfreedelivery.herokuapp.com/#!/home
Presentation: https://www.youtube.com/watch?v=C7kVAKCOuog&t=2s

## Requirements

A recent Gradle (>= 6.1.1 but < 7.0.0) and JDK 11.
MongoDB Server Version 4.4.1 or upper.
Heroku >= 7.47.2.
VScode (recommended) with Plugin Live Server .

## Building

To get the environment ready, run `./gradlew build`

## Testing
Use the following command to run tests and check out Jacoco Coverage Report.

`./gradlew test`

## Running

`./gradlew run`

The server will start on port 5000 by default.
Example, localhost:5000/customers would display customer information.

## MongoDB
Follow this link to install and get started with MongoDB server. (Version 4.4.1 recommended)
If you want to run the application in localhost, make sure you have a database named as“test".
To configure the connection to your MongoDB database or customize the database name, go to‘Service/MongoDBService.java’on backend.
If you don't want to hardcode your database URI, checking out following instruction and leverage Heroku.

## Deploying to Heroku

Follow this instruction to install Heroku and deploy your Java application. https://devcenter.heroku.com/articles/getting-started-with-java

In terminal, use  `heroku login`,  `heroku create app`, `git push heroku master` to deploy your code.

You could also set up auto-deployment of your Github onto Heroku. https://devcenter.heroku.com/articles/github-integration

### Connecting your MongoDB and Heroku
Enter your MongoDB connection credentials to Heroku - Your App - Settings - Config Vars.

## Frontend Repository
Frontend Repository: https://github.com/BugFreeArmy5500/delivery_frontend
To carry on work based on our frontend, clone the repository from the above link and run home.html in your browser. In VSCode, we recommend to install Live Server plugin to run the webpage.

## Spotless?

Spotless automatically formats code. If it detects errors, run `./gradlew spotlessApply`
to automatically fix them. `./gradlew spotlessCheck` can be used to directly invoke
Spotless.

## Design

Design repository: https://github.com/BugFreeArmy5500/Design, includes all of our sprints boards.

Design Document: https://docs.google.com/document/d/1-BZh8djnD5Jc-nF6-oFH3oNFBehbYx-HTSgLUkD90dg/edit#


## Future Work
Use the google map API to make the delivery more effective, to show the restaurant in order by distance from each restaurant to the destination, with an estimate delivering time cost. And after the customer set the delivery, send that order to the closet rider.

## Note
Our frontend has a fake PHP backend which performs no functionality. We added it so that we can deploy our frontend code as well as assets(images and fonts) to Heroku easily.

