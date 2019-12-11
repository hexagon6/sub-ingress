import fs from "fs";
import { URL } from "url";
import yaml from "js-yaml";

import logger from "./logger.mjs";

// validate by parsing with WHATWG URL parser, should throw if not ok, TODO: test throwing
const validatedomainName = name => new URL(`http://${name}`).host;

const walkConfigDir = () =>
  fs
    .readdirSync("./config/")
    .filter(name => name.endsWith(".yml"))
    .map(name => name.split(".yml")[0]);

const loadConfig = domainName => {
  const data = yaml.safeLoad(
    fs.readFileSync(`./config/${domainName}.yml`, "utf8")
  );
  return { [domainName]: data };
};

const logC = logger("🐒");
const validateConfig = () => {
  const domains = walkConfigDir();
  let config;
  if (Array.isArray(domains)) {
    config = domains && domains.length > 0 ? domains.map(loadConfig).reduce((a, c) => ({ ...a, ...c })) : {};
  }
  logC("🔎")("found following domains:", domains);
  logC("🍌")("validating entries from: ", config);
  domains.map(validatedomainName);
  //.map(console.dir)

  const mapConfig = Object.entries(config)
    .map(([domain, subdomains]) =>
      Object.entries(subdomains)
        .map(([sub, tuple]) => ({ sub, tuple }))
        .map(({ sub, tuple }) =>
          validatedomainName(sub) ? { sub, tuple } : null
        )
        .filter(i => i)
        .map(({ sub, tuple }) => ({ [`${sub}.${domain}`]: tuple }))
        .reduce((a, c) => ({ ...a, ...c }), {})
    )
    .reduce((a, c) => ({ ...a, ...c }), {});
  return mapConfig;
};

export default validateConfig;
