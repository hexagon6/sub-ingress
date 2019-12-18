# http-ingress

## Purpose

This software package can run a simple http-based ingress server, configurable with a yaml-file.

It should map incoming HTTP requests like a reverse proxy.

e.g.

We have a configuration file

like this

config/example.com.yml

```yaml
www: '10.0.0.2:2444'
www2: '10.0.0.2:2445'
```

which should forward HTTP requests to the defined endpoint

```network
HTTP -> `www.example.com` -> `10.0.0.2:2444`
HTTP -> `www2.example.com` -> `10.0.0.2:2445`
```

- [ ] Setup tests (ava & supertest)
