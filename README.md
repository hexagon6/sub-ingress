# http-ingress

## Purpose
This software package can run a simple http-based ingress server, configurable with a yaml-file.

It should map incoming HTTP requests like a reverse proxy.

e.g.

We have a configuration file

like this

config/mydomain.com.yml
```yaml
sub1: "10.0.0.2:2444"
sub2: "10.0.0.2:2445"
```

which should forward HTTP requests to the defined endpoint

```network
HTTP -> `sub1.mydomain.com` -> `10.0.0.2:2444`
HTTP -> `sub2.mydomain.com` -> `10.0.0.2:2445`
```

* [ ] Setup tests (ava & supertest)
