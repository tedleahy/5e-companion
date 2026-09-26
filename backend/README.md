# README

This README would normally document whatever steps are necessary to get the
application up and running.

Things you may want to cover:

* Ruby version

* System dependencies

* Configuration

* Database creation

* Database initialization

* How to run the test suite

* Services (job queues, cache servers, search engines, etc.)

* Deployment instructions

* ...

## Running on the tailnet

`bin/dev` listens on 127.0.0.1, so a phone can't reach it. To open the app on a
phone over Tailscale, listen on this computer's Tailscale address instead:

```
bin/dev -b "$(tailscale ip -4)"
```

Don't bind to 0.0.0.0. That exposes the demo bearer token to whatever network
the computer is on. A browser on this computer can use the Tailscale address
too.

In development, the API accepts cross-origin requests from `localhost`,
`127.0.0.1`, Tailscale addresses (100.64.0.0/10) and MagicDNS names ending in
`.ts.net`. See `config/initializers/cors.rb`.
