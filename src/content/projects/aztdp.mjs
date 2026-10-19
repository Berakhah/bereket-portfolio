// AZTDP — Adaptive Zero-Trust Defense Platform. Security / backend systems case study.
// Source: github.com/Berakhah/Adaptive-Zero-Trust-Defense-Platform--AZTDP- (README, docs/, docker-compose.yml,
// .github/workflows/ci.yml). Counts below were taken from a clone on 2026-10-19.

const REPO = "https://github.com/Berakhah/Adaptive-Zero-Trust-Defense-Platform--AZTDP-";

export const project = {
  slug: "aztdp",
  name: "AZTDP",
  tagline: "Adaptive Zero-Trust Defense Platform — per-request behavioural risk scoring on top of valid JWTs",
  plain: "Scores how every request behaves, not only whether its login token is valid, so a stolen token gets stopped instead of trusted.",
  statement: "A valid token is not proof of a legitimate caller.",
  status: {
    code: "running",
    label: "Running",
    detail:
      "Public repository with a Docker Compose stack, CI workflow, threat model, ADRs and runbooks; the repository's milestone tracker marks all 13 phases complete. Not independently verified here.",
  },
  category: ["Security", "Backend Systems", "Zero Trust"],
  role: "Engineer — threat model, architecture, implementation",
  tech: ["Python", "Django", "Spring Boot (Java)", "TypeScript", "Keycloak (OIDC)", "Open Policy Agent", "Redis", "PostgreSQL", "Prometheus", "Grafana", "Docker Compose", "Kubernetes + Helm", "GitHub Actions", "Locust"],
  flow: ["Request + JWT", "JWT verify (JWKS)", "Risk evaluation", "Policy decision (OPA)", "Allow · deny · step-up · revoke"],
  links: { github: REPO },
  licence: "No licence declared",

  card: {
    differentiator:
      "The check runs synchronously on the request path, before any business logic: IP drift, geo drift, device change, request-rate anomalies and an ML anomaly score decide the outcome, and a token seen from a new IP within 60 seconds is hard-denied even in fail-open mode.",
    metrics: [
      {
        id: "az-services",
        value: "16",
        label: "services in one Compose stack",
        context: "Gateway, risk engine, anomaly service, telemetry, forensics, two sample apps, Keycloak, OPA, Redis, Postgres, Prometheus, Grafana.",
        evidence: {
          claim: "The repository's docker-compose.yml defines 16 services.",
          method: "DETERMINISTIC",
          source: { label: "docker-compose.yml — services", href: REPO },
          basis: "Counted by parsing docker-compose.yml from a clone of the public repository on 2026-10-19.",
          observedAt: "2026-10",
          caveats: ["The README describes a 13-service stack; the compose file defines more than that today."],
        },
      },
      {
        id: "az-outcomes",
        value: "4",
        label: "enforcement outcomes",
        context: "allow · deny (403) · step-up (401 + MFA) · revoke (revoke + 403).",
        evidence: {
          claim: "Every protected request ends in one of four enforcement outcomes.",
          method: "HUMAN",
          source: { label: "README — enforcement chain", href: REPO },
          basis: "Stated in the README: JWT verify (RS256, JWKS cached 5 min), risk evaluation, policy decision through the gateway and OPA, then enforce.",
          observedAt: "2026-10",
          caveats: ["Taken from the documentation; not re-derived from the code here."],
        },
      },
      {
        id: "az-tests",
        value: "82",
        label: "test functions",
        context: "73 Python and 9 Java, plus a live attack-simulation suite and a Locust load test.",
        evidence: {
          claim: "The repository contains 82 registered test functions: 73 Python and 9 Java.",
          method: "DETERMINISTIC",
          source: { label: "Repository — test function count", href: REPO },
          basis: "Counted from a clone on 2026-10-19: 73 Python `def test_` functions and 9 Java `@Test` annotations.",
          observedAt: "2026-10",
          caveats: ["Counts test functions, not assertions.", "Live attack-simulation tests only run against a running stack."],
        },
      },
    ],
    caveat:
      "Single-region only, and the client-IP and geo headers are only trustworthy behind a verified upstream proxy; the repository lists these limits itself.",
  },

  caseStudy: {
    problem:
      "Zero-trust deployments usually stop at the token: if the JWT verifies, the request is trusted. A stolen or replayed token then works from anywhere, and nothing on the request path notices that the caller’s IP, location or device just changed.",
    whyFails: [
      "Signature checks answer “was this token issued by us?”, never “is this the same caller who was issued it?”.",
      "Anomaly scoring done after the fact (in a SIEM) detects a hijack minutes later, after the data has already left.",
      "A scorer that fails closed takes the platform down when the scorer restarts; one that fails open silently disables the defence. Both defaults are wrong unless they are a deliberate, per-service choice.",
    ],
    architecture: {
      intro:
        "A request carries a Bearer JWT to a protected service. The service verifies it against Keycloak’s JWKS, asks the risk engine to score drift and anomaly, then asks the gateway for a policy decision, which queries OPA and checks the revocation list in Redis. Telemetry from every step lands in PostgreSQL for forensics, and Prometheus and Grafana watch the whole chain.",
      tree: `services/
  django-app/        sample protected service (Python)
  spring-app/        sample protected service (Java)
  gateway/           policy decision API → OPA + revocation check
  risk-engine/       IP / geo / device / rate drift scoring
  anomaly-service/   ML anomaly score
  telemetry-ingest/  event persistence → PostgreSQL
  forensics/         incident replay and event search
  attack-sim/        scripted attacks with expected outcomes
  dashboard/         operator UI
policies/opa/        Rego policy
infra/               Kubernetes manifests, Helm chart, Postgres init
docs/                threat model · architecture + ADRs · API contracts
                     · data model · runbooks`,
    },
    threatModel: [
      "**Token theft and replay.** If the same token’s IP changes within 60 seconds the request is hard-denied (HTTP 409 → 403), regardless of fail-open mode.",
      "**Privilege escalation and revocation.** A revoke outcome revokes the token and denies the request; the revocation handle is a SHA-256 hash of the JTI, not the raw JTI.",
      "**Spoofed context headers.** `X-Client-Ip` and `X-Geo` are user-controllable, so the documentation says to trust them only from a verified upstream reverse proxy.",
      "**Scorer outage.** Fail-open is a per-service setting, off by default, instead of a hard-coded behaviour.",
      "**Documented analysis.** The repository carries a STRIDE threat model with eight named gaps and attack scenarios, and a forensics runbook organised by attack type.",
    ],
    decisions: [
      {
        title: "Synchronous enforcement on the request path",
        body:
          "Scoring and policy decisions run before business logic, so a bad request is stopped rather than reported later. The cost is a latency budget, which the architecture document sets out.",
      },
      {
        title: "Apps call the gateway, never OPA directly",
        body:
          "One decision point owns policy evaluation and revocation, so the sample apps in two languages stay thin and cannot drift apart.",
      },
      {
        title: "Fail-open is configurable, not hard-coded",
        body:
          "AZTDP_FAIL_OPEN is set per service and defaults to false, so availability against security is an explicit, reviewable choice.",
      },
      {
        title: "Replay window of 60 seconds, not the token lifetime",
        body:
          "A short window keeps the replay state small in Redis. The documentation states the trade-off: an attacker who waits 61 seconds avoids the replay flag but still triggers IP-drift scoring.",
      },
    ],
    implementation: [
      "Stack: Django and Spring sample apps behind a gateway, risk engine, anomaly service, telemetry ingest and forensics service; Keycloak for OIDC, OPA for policy, Redis for revocation and drift state, PostgreSQL for telemetry.",
      "Operations: Prometheus and Grafana dashboards, Kubernetes manifests and a Helm chart, a GitHub Actions CI workflow that lints and tests the Python and Java services.",
      "Testing: Python and Java unit tests, a live attack-simulation suite that asserts expected outcomes against a running stack, and a Locust load test.",
      `Repo: ${REPO.replace("https://", "")}.`,
    ],
    evidence: [
      "**Counts are reproducible:** the service and test-function counts above come from a clone of the public repository and can be re-run by anyone.",
      "**Attack outcomes are asserted, not described:** the attack-sim suite checks that each scripted attack ends in its expected allow, deny, step-up or revoke.",
      "**Known gaps are written down:** the architecture document has a “Known gaps” table and the README has a limitations section, instead of leaving them to be discovered.",
    ],
    securityControls: [
      "**Per-request behavioural scoring** on top of RS256 JWT verification with cached JWKS.",
      "**Policy as code** in OPA, decided at the gateway and never in the apps.",
      "**Token revocation** by hashed handle, checked on every decision.",
      "**Fail-open off by default,** per-service, with replay protection that ignores it.",
    ],
    tradeoffs: [
      "**Synchronous scoring** adds latency to every request in exchange for stopping the request instead of reporting it.",
      "**A 60-second replay window** is cheap to store and misses a patient attacker, who is left to drift scoring.",
      "**Two sample apps (Django and Spring)** double the integration surface in exchange for proving the contract is language-neutral.",
    ],
    limitations: [
      "`X-Client-Ip` and `X-Geo` must only be trusted from a verified upstream proxy.",
      "The anomaly service fails open: while it restarts or retrains, requests are not blocked.",
      "Single-region only — no multi-region replication for Redis or PostgreSQL.",
      "No licence file is present in the repository.",
    ],
    currentStatus:
      "Running — public repository with Compose stack, CI, threat model, ADRs and runbooks; the milestone tracker marks all 13 phases complete. Not independently verified here. No licence declared.",
    repoNote: `Public repository: ${REPO.replace("https://", "")}.`,
  },
};
