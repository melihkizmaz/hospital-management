<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# <center>A Hospital Management System</center>

## Tech Stack

- NestJS
  - Deployed on [<ins>railway</ins>](https://hospital-management.up.railway.app/).
- MongoDB
  - Deployed on Atlas.
- Docker

## Postman Files

You can fork postman [<ins>collection</ins>](https://www.postman.com/interstellar-satellite-731506/workspace/melih-kzmaz-public-workspace/collection/18029963-5412c1c1-00ff-4ba1-963b-4f3e4427c0cb?action=share&creator=18029963) and environment [<ins>environment</ins>](https://www.postman.com/interstellar-satellite-731506/workspace/melih-kzmaz-public-workspace/environment/18029963-1e1ad911-8b4f-4264-a64c-22a587b285c7).

You can take a look at the postman documentation [<ins>here</ins>](https://documenter.getpostman.com/view/18029963/UzJHRdXw#e33e3aca-ac84-4464-a93a-7a51883a309f).

When you import the postman collection and the environment, the **_Tests script_** is saves the bearer token to the environment if loggin was succesfull.
You can see **_Tests script_** image below.

<p align="center">
 <img src="./assets/login-test.png" alt="Create Appointment Flow" />
</p>

## Installation

```bash
# Install dependencies
$ yarn
```

## Running the app

```bash
# Build and start the container
$ docker-compose up -d

# Watch mode
$ yarn start:dev
```

## <center>Database relation diagram</center>

<p align="center">
 <img src="./assets/database-relation-diagram.png" alt="Mongo Database Diagram" />
</p>

## <center>Create Appointment Flow</center>

<p align="center">
 <img src="./assets/create-appointment-diagram.png" alt="Create Appointment Flow" />
</p>
