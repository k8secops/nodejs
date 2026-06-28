# Node.js Frontend

Express.js frontend that serves the dashboard UI and acts as a proxy/aggregator for the Go and Java backend services.
Part of the **GitOps Demo** multi-service application.

## Role in the Demo

```
Browser → Node.js Frontend (this) → Go Catalog Service   :8081
                                  → Java Inventory Service :8080
```

This is the only service exposed to the browser (NodePort 30080). It:
- Serves the dashboard HTML from `public/index.html`
- Proxies API calls to the Go and Java services
- Aggregates health status from all three services

## Dashboard Features

- **Service health indicators** — live dots showing Go, Java, and Node.js status
- **Product Catalog** — card grid fetched from the Go service
- **Inventory table** — product stock levels from the Java service
- **Orders table** — recent orders from the Java service
- **Place Demo Order** — button that POSTs a random order to Java and refreshes live
- **Auto-refresh** — data reloads every 30 seconds

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/` | Dashboard UI (index.html) |
| GET | `/health` | Node.js health check |
| GET | `/api/services/health` | Aggregated health of Go + Java + Node.js |
| GET | `/api/catalog` | Proxy → Go `/products` |
| GET | `/api/inventory/products` | Proxy → Java `/api/v1/products` |
| GET | `/api/inventory/orders` | Proxy → Java `/api/v1/orders` |
| POST | `/api/inventory/orders` | Proxy → Java `POST /api/v1/orders` |

## Run Locally

**Prerequisites:** Node.js 20+

```bash
npm install
npm start
# Opens on http://localhost:3000
```

With backends running locally:
```bash
GO_SERVICE_URL=http://localhost:8081 \
JAVA_SERVICE_URL=http://localhost:8080 \
npm start
```

## Test

```bash
npm test
```

8 tests covering health, legacy routes, proxy routes (accept 200 or 502), and the services health aggregator.

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `GO_SERVICE_URL` | `http://localhost:8081` | Go catalog service base URL |
| `JAVA_SERVICE_URL` | `http://localhost:8080` | Java inventory service base URL |

## Docker

```bash
docker build -t demo-nodejs .
docker run -p 3000:3000 \
  -e GO_SERVICE_URL=http://go-catalog:8081 \
  -e JAVA_SERVICE_URL=http://java-inventory:8080 \
  demo-nodejs
```

## Kubernetes

Manifests are in [`kubernetes/`](kubernetes/):

| File | Purpose |
|------|---------|
| `namespace.yaml` | Creates the `demo` namespace |
| `configmap.yaml` | Sets `GO_SERVICE_URL` and `JAVA_SERVICE_URL` using K8s service DNS |
| `deployment.yaml` | 1 replica, reads env from ConfigMap |
| `service.yaml` | **NodePort 30080** — browser-accessible entry point |
| `kustomization.yaml` | Kustomize entrypoint |

Apply:
```bash
kubectl apply -k kubernetes/
```

Access the dashboard at `http://<node-ip>:30080`

> **Image:** Update `DOCKERHUB_USER/demo-nodejs:latest` in `deployment.yaml` with your registry image after the CI pipeline builds and pushes it.

## CI Pipeline (gitops-platform)

When onboarding in the gitops-platform, set:
- **Language:** Node.js
- **Dockerfile:** `Dockerfile`
- **Build context:** `.`
- **Compile command:** `npm install`
- **Test command:** `npm test`
