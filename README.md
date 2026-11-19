# What's in My Library?

A music guessing game built on your own Spotify library. The app plays a short clip of a random song from your saved tracks, saved albums, and playlists, and you guess the **artist**, **song**, and **album**. Shorter clips are harder, and your scores are saved per difficulty.

Built with React and JavaScript, the Spotify Web API, and the Spotify Web Playback SDK. Authentication is handled with the Spotify Authorization Code flow through serverless Netlify Functions.

> **Requires a Spotify Premium account.** The Web Playback SDK only streams for Premium users.

Check it out: https://whats-in-my-library.netlify.app/
> **Email needs to be manually added by developer.**
## Features

- **Plays from your library:** pulls songs from your liked songs, saved albums, and playlists, then shuffles them into a game queue.
- **Three difficulty modes:** hear 1, 5, or 10 seconds of each song.
- **Scoring:** artist = 1 point, song = 2 points, album = 3 points. High scores are tracked for each mode.
- **Typo-tolerant guessing:** guesses are compared to the answer with Levenshtein distance and a similarity percentage, so small spelling mistakes still count.
- **Progress is saved:** your queue position, scores, and selected mode are kept in the browser, so you can pick up where you left off.
- **Anti-cheat:** you can't switch difficulty in the middle of a game.
- **Responsive UI:** built with React Bootstrap.

## Tech Stack

| Area | Tools |
|---|---|
| Front end | React 18, React Bootstrap / Bootstrap 5, JavaScript (ES6+) |
| Spotify | Web API (`/me`, `/me/tracks`, `/me/albums`, `/me/playlists`, `/me/player`), Web Playback SDK |
| Auth and back end | Netlify Functions (Node.js), Axios, OAuth 2.0 Authorization Code flow |
| Storage | `localStorage`, with `lz-string` compression for the cached track list |
| Hosting | Netlify |

## How Authentication Works

Spotify requires a client secret to exchange an authorization code for tokens, and a secret can't safely live in front-end code. This project keeps the secret on the server side with three Netlify Functions:

1. **`/login`** generates a random `state` value, stores it in a cookie (`Secure; HttpOnly` in production), and redirects the user to Spotify's authorize page with the scopes the game needs.
2. **`/callback`** is where Spotify sends the user back. It checks that the returned `state` matches the cookie, which protects against CSRF. It then exchanges the authorization code for an access token and refresh token using the client ID and secret, and redirects back to the app.
3. **`/refresh_token`** trades a refresh token for a new access token, so users aren't logged out when the one-hour token expires.

On the client:

- `getHashParams` reads the tokens and expiry from the URL after login.
- `App.js` keeps the tokens in React state, requests a new access token before the old one expires (every 55 minutes), and updates the Web Playback SDK's `getOAuthToken` callback so playback continues uninterrupted.
- The app calls `/v1/me` after login to check for a Premium account, and sends users back to the login page if the token is rejected.

### Scopes requested

`user-library-read`, `user-read-email`, `user-read-private`, `user-modify-playback-state`, `user-read-playback-state`, `streaming`, `playlist-read-private`

## Working with the Spotify API

- Spotify returns results one page at a time (50 items maximum), so `fetchAllTracks.js` loops with `limit` and `offset` until it has enough tracks or runs out of results.
- Saved tracks, albums, and playlists each have their own response shape. The code converts them into one consistent track format that the game uses.
- The track list is shuffled with a Fisher-Yates shuffle, compressed with LZ-String, and cached in `localStorage` so the game doesn't re-fetch the whole library each time it loads.
- Playback goes through the Web Playback SDK. The app waits for the SDK to be ready, registers a browser device, transfers playback to it, and stops the song after the chosen clip length.

## Project Structure

```
functions/
  login.js            # redirects to Spotify, sets the state cookie
  callback.js         # validates state, exchanges the code for tokens
  refresh_token.js    # returns a new access token
  utils/auth-config.js
src/
  App.js              # token state, refresh timer, Premium check
  components/         # Dashboard, Player, GuessBox, Score, buttons, modals
  util/
    auth.js           # reads tokens from the URL
    fetchAllTracks.js # paginated Spotify API calls, shuffle, caching
    guessValidator.js # Levenshtein distance and similarity %
netlify.toml
```

## Getting Started

### Prerequisites

- Node.js 18 or newer
- A Spotify Premium account
- A [Spotify Developer](https://developer.spotify.com/dashboard) app (gives you a client ID and secret)
- [Netlify CLI](https://docs.netlify.com/cli/get-started/): `npm install -g netlify-cli`

### Setup

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/jhachey718/whats-in-my-library.git
   cd whats-in-my-library
   npm install
   ```
2. In the Spotify Developer Dashboard, add this redirect URI to your app:
   ```
   https://localhost:8888/.netlify/functions/callback
   ```
   For a deployed site, use `https://<your-site>.netlify.app/.netlify/functions/callback`.
3. Create a `.env` file in the project root:
   ```
   REACT_APP_CLIENT_ID=your_spotify_client_id
   REACT_APP_CLIENT_SECRET=your_spotify_client_secret
   ```
4. Create a local HTTPS certificate (for example with [mkcert](https://github.com/FiloSottile/mkcert)) named `localhost.pem` and `localhost-key.pem` in the project root. `netlify.toml` uses them for local HTTPS.
5. Start the app through Netlify so the functions run too:
   ```bash
   netlify dev
   ```
   Then open `https://localhost:8888`.

### Deploying

Connect the repo to Netlify. The build settings are in `netlify.toml`. Add `REACT_APP_CLIENT_ID` and `REACT_APP_CLIENT_SECRET` as environment variables in the Netlify dashboard.

## How to Play

1. Log in with Spotify.
2. Choose a clip length (1s, 5s, or 10s).
3. Press play, then type your guess for the artist, song, and album.
4. Press next to move on. Your score is saved for that mode.

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Runs the React app only (no functions, so login won't work) |
| `netlify dev` | Runs the app and the Netlify Functions together |
| `npm run build` | Builds for production |
| `npm test` | Runs the test runner |

## Ideas for the Future

- Share scores or play against friends
- Hint and streak features
- Unit tests for the guess validator and track-fetching utilities
