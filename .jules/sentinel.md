## 2024-05-18 - Enforce TLS by default
**Vulnerability:** Missing TLS Enforcement (Plaintext Health Data Transmission)
**Learning:** The FastAPI server had a middleware that optionally enforced HTTPS only if a specific environment variable (`FORCE_HTTPS=true`) was provided. The default behavior was to allow plaintext HTTP, leaving patient health data and authentication tokens exposed to interception.
**Prevention:** Always default to "secure by default" configurations for any service handling PII or sensitive health data. `FORCE_HTTPS` should default to `true`, and require an explicit opt-out rather than an explicit opt-in for unencrypted development connections.
