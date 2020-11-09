# Spotify Listening Party

## Prerequisites

### Yarn

This project uses the package manager yarn. Make sure to install it on your system, e.g. via `npm install -g yarn`.

### Docker

In order to generate reliable, fast, reproducible and deterministic deployments, we use [Docker](https://www.docker.com/). Make sure you have it installed on your system.

### Development Browser

For developing the application it is recommended to use Firefox, since [Chrome does not allow EME in non-secure contexts](https://groups.google.com/a/chromium.org/g/blink-dev/c/tXmKPlXsnCQ/discussion?pli=1) (ie. over HTTP). Otherwise it is not possible to initialize the Spotify-Player in the browser.

## Setup

Copy the `env.example` files in both /frontend and /api and rename them to `.env`. These already contain all necessary keys, however, some of the values have to be replaced.

For the local development of the app it is necessary to create a Spotify-Developer-App. Head to [https://developer.spotify.com/dashboard/](https://developer.spotify.com/dashboard/) and login with your Spotify-Account. 

Then click on `"Create An App"`, give it a name and description and click on `"Create"`. Now on the left side you should see your `Client ID`. Copy this id and replace the default value for `REACT_APP_CLIENT_ID` in your frontend-`.env` file.

Go back to the Spotify dashboard and click on `"Edit Settings"` inside your newly created app. 

Inside the opening pop-up add `http://localhost:3000/auth` to your Redirect URIs and hit `"Save"`.

## Development

Building the application:

```bash
docker-compose build
```

Afterwards head to the `api` and the `frontend` folder and run the following command in each case 

```bash
yarn
```

Start the whole application in development mode using

```bash
docker-compose up -d
```

Stop the application using

```bash
docker-compose down
```

