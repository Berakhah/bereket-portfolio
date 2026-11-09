// AZTDP — Adaptive Zero-Trust Defense Platform. Security / backend systems case study.
// Source: github.com/Berakhah/aztdp (README, docs/, docker-compose.yml,
// .github/workflows/ci.yml, docs/PRODUCTION_READINESS.md). Counts re-taken from a clone on 2026-11-04.

const REPO = "https://github.com/Berakhah/aztdp";

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
      "Runs as a Docker Compose stack with CI, threat model, ADRs and runbooks — 60 commits, 4 May → 6 Nov 2026. Its own readiness tracker says “not ready for production yet”: 16 of 18 hardening tasks are done, and both provisional SLOs are missed.",
  },
  category: ["Security", "Backend Systems", "Zero Trust"],
  role: "My personal project. Dashboard scaffold and UI generated with Lovable; logic, security controls and tests written and reviewed by me, much of it with Claude Code",
  tech: ["Python", "Django", "FastAPI", "Spring Boot (Java)", "TypeScript", "Keycloak (OIDC)", "Open Policy Agent", "Redis", "PostgreSQL", "nginx", "Prometheus", "Alertmanager", "Grafana", "Docker Compose", "GitHub Actions", "cosign", "Locust"],
  flow: ["Request + JWT", "JWT verify (JWKS)", "Risk evaluation", "Policy decision (OPA)", "Allow · deny · step-up · revoke"],
  links: { github: REPO },
  licence: "Apache-2.0",

  card: {
    differentiator:
      "The check runs synchronously on the request path, before any business logic: IP drift, geo drift, device change, request-rate anomalies and an ML anomaly score decide the outcome, and a token seen from a new IP within 60 seconds is hard-denied even in fail-open mode.",
    metrics: [
      {
        id: "az-services",
        value: "19",
        label: "services in one Compose stack",
        context: "Gateway, risk engine, anomaly service, telemetry, forensics, two sample apps, Keycloak, OPA, Redis, Postgres, nginx, Prometheus, Alertmanager, Grafana, a one-shot migrator and more.",
        evidence: {
          claim: "The repository's docker-compose.yml defines 19 services.",
          method: "DETERMINISTIC",
          source: { label: "docker-compose.yml — services", href: REPO },
          basis: "Counted by parsing docker-compose.yml from a clone of the public repository on 2026-11-04.",
          observedAt: "2026-11",
          caveats: ["Includes one-shot and support services (for example db-migrate), not only long-running application services."],
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
        value: "196",
        label: "Python test functions",
        context: "Plus 16 Java tests (not counted), plus a live attack-simulation suite and a Locust load test.",
        evidence: {
          claim: "The repository contains 196 Python test functions (plus 16 Java tests, not counted here).",
          method: "DETERMINISTIC",
          source: { label: "Repository — test function count", href: REPO },
          basis: "Counted from a clone on 2026-11-04: 196 Python `def test_` functions and 16 Java `@Test` annotations. Up from 82 on 2026-10-19, after the production-readiness pass added per-service test runs and tests for two previously untested services.",
          observedAt: "2026-11",
          caveats: ["Counts test functions, not assertions.", "Live attack-simulation tests only run against a running stack."],
        },
      },
      {
        id: "az-p99",
        value: "820 ms",
        label: "p99 at 14 req/s — SLO missed",
        context: "Provisional target is p99 < 250 ms and < 0.1% errors; no load-test run meets either.",
        evidence: {
          claim: "In the best load-test run, end-to-end p99 latency was 820 ms against a provisional 250 ms target.",
          method: "DETERMINISTIC",
          source: { label: "docs/PERFORMANCE_BASELINE.md", href: REPO },
          basis: "Measured 2026-10-20 with the committed Locust file through nginx → Django → risk engine → anomaly service + gateway → OPA: 15 users, 14.0 req/s, p50 110 ms, p95 270 ms, p99 820 ms, 0.12% errors. The anomaly service, single-worker by design, tops out near 29 req/s.",
          observedAt: "2026-10-20",
          caveats: ["Shared development host with other stacks running — indicative, not a reference-host result.", "The SLOs are provisional: the target request rate is not defined yet."],
        },
      },
    ],
    caveat:
      "Not production-ready, by its own tracker: both provisional SLOs are missed, the go-live checklist has not been executed, the release workflow has never run on a tag, and five of my design decisions are still open. Single-region, Compose-only.",
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
sentinel-command-main/  SOC dashboard; scaffold and UI generated with Lovable
policies/opa/        Rego policy
scripts/db/migrations/  one migration path, run by db-migrate
infra/               nginx ingress, Prometheus + Alertmanager rules,
                     Postgres init (Kubernetes/Helm unmaintained)
docs/                threat model · architecture + ADRs · API contracts
                     · data model · runbooks`,
    },
    threatModel: [
      "**Token theft and replay.** If the same token’s IP changes within 60 seconds the request is hard-denied (HTTP 409 → 403), regardless of fail-open mode.",
      "**Privilege escalation and revocation.** A revoke outcome revokes the token and denies the request; the revocation handle is a SHA-256 hash of the JTI, not the raw JTI.",
      "**Spoofed context headers.** `X-Client-Ip` and `X-Geo` are user-controllable, so the documentation says to trust them only from a verified upstream reverse proxy.",
      "**Scorer outage.** Fail-open is a per-service setting, off by default, instead of a hard-coded behaviour.",
      "**Documented analysis.** The repository carries a STRIDE threat model with eight named gaps and attack scenarios, and a forensics runbook organised by attack type.",
      "**Step-up brute force and replay.** Step-up TOTP challenges are Redis-backed, attempt-limited and bound to the token; replayed TOTP codes are rejected, and there are no default shared secrets.",
      "**Tampered model artifacts.** The anomaly model is HMAC-verified before it is loaded.",
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
        title: "Reopen “done” when it turns out to be false",
        body:
          "An earlier tracker marked every audit item done. A 19 Oct 2026 analysis found several of those claims were false: internal-auth tests never sent the token and the suite was red, the forensics service had no auth, step-up challenges broke across workers, and revocations were not durable. The items were reopened as findings F-01 to F-20, fixed across 18 tasks, and PRODUCTION_READINESS.md now records what closed each one.",
      },
      {
        title: "Measure the SLO, and publish the miss",
        body:
          "Resource limits and a restart policy went in, then a Locust baseline was run and written up with its test conditions. Neither provisional SLO is met. The document says so, names the anomaly service as the throughput ceiling, and leaves SLO enforcement off in CI until I settle the numbers.",
      },
      {
        title: "Replay window of 60 seconds, not the token lifetime",
        body:
          "A short window keeps the replay state small in Redis. The documentation states the trade-off: an attacker who waits 61 seconds avoids the replay flag but still triggers IP-drift scoring.",
      },
    ],
    implementation: [
      "Stack: Django and Spring sample apps behind a gateway, risk engine, anomaly service, telemetry ingest and forensics service; Keycloak for OIDC, OPA for policy, Redis for revocation and drift state, PostgreSQL for telemetry.",
      "Operations: Prometheus, Alertmanager availability alerts and Grafana dashboards; backups with a tested restore; per-service database roles and an append-only audit table; container hardening, resource limits and a restart policy.",
      "CI/CD: a rewritten pipeline protects main with 13 required checks (tests, security gates, an nginx smoke test, dependency audits). A release workflow (GHCR images, cosign signatures, SBOM, image scan, gated on green CI) is written but has not yet run on a tag.",
      "Testing: Python and Java unit tests, a live attack-simulation suite that asserts expected outcomes against a running stack, and a Locust load test.",
      `Repo: ${REPO.replace("https://", "")}.`,
    ],
    evidence: [
      "**Counts are reproducible:** the service and test-function counts above come from a clone of the public repository and can be re-run by anyone.",
      "**Attack outcomes are asserted, not described:** the attack-sim suite checks that each scripted attack ends in its expected allow, deny, step-up or revoke.",
      "**Known gaps are written down:** KNOWN_LIMITATIONS.md marks each limitation accepted, open or measured, and PRODUCTION_READINESS.md lists the open blockers and my open decisions, instead of leaving them to be discovered.",
      "**False “done” claims reopened in public:** the readiness tracker marks which earlier audit items were wrongly closed and which finding closed each one.",
    ],
    securityControls: [
      "**Per-request behavioural scoring** on top of RS256 JWT verification with cached JWKS.",
      "**Policy as code** in OPA, decided at the gateway and never in the apps.",
      "**Token revocation** by hashed handle, checked on every decision.",
      "**Fail-open off by default,** per-service, with replay protection that ignores it.",
      "**Fail fast on missing secrets;** exact-match auth allowlists; metrics hidden at the ingress; known dependency advisories cleared across pip, npm and Maven.",
    ],
    tradeoffs: [
      "**Synchronous scoring** adds latency to every request in exchange for stopping the request instead of reporting it.",
      "**A 60-second replay window** is cheap to store and misses a patient attacker, who is left to drift scoring.",
      "**Two sample apps (Django and Spring)** double the integration surface in exchange for proving the contract is language-neutral.",
    ],
    limitations: [
      "Not production-ready: both provisional SLOs are missed (best run p99 820 ms), the go-live checklist has not been run, and the release workflow has never run on a tag.",
      "Anomaly scoring fails open: if the anomaly service errors or exceeds its 150 ms timeout, the request is scored without the ML signal. Every fallback is now counted and alerted on; whether high-sensitivity endpoints should fail closed is a decision I haven’t made yet.",
      "The replay check is not atomic, so two concurrent requests on one token can both pass it (accepted).",
      "`X-Client-Ip` and `X-Geo` are trusted only from the pinned nginx address; anything that reaches the apps without going through nginx can spoof them.",
      "Single region, single node, Compose only; Kubernetes and Helm manifests are no longer maintained.",
    ],
    currentStatus:
      "Running, not production-ready — 60 commits between 4 May and 6 Nov 2026. A production-readiness pass (PR #2, merged 27 Oct 2026) closed 16 of 18 hardening tasks; quarantining Kubernetes/Helm and wiring one SOC dashboard to real data remain, along with the SLO miss and five open design decisions. Licence: Apache-2.0.",
    repoNote: `Public repository: ${REPO.replace("https://", "")}.`,
  },
};
