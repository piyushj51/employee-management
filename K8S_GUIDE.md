# Kubernetes (K8s) Distributed Architecture & Operations Guide
**Full-Stack Application: FastAPI + PostgreSQL + React**

This document explains the Kubernetes architecture, manifests, local multi-node cluster setup, day-to-day operations, and troubleshooting solutions. Use this as your reference template for container orchestrating distributed systems.

---

## 1. Architecture: Docker Compose vs. Kubernetes

| Architectural Concern | Docker Compose (Single Host) | Kubernetes (Distributed Cluster) |
| :--- | :--- | :--- |
| **Workload Runner** | `service: backend` | **Deployment** (orchestrates Pods with zero-downtime rolling updates) |
| **Networking & DNS** | Virtual bridge (`db:5432`) | **Service (ClusterIP)**: cluster-internal DNS & load balancer (`postgres-svc:5432`) |
| **External Traffic** | `ports: 8000:8000` | **Service (LoadBalancer / Ingress)** |
| **Configuration** | `.env` file | **ConfigMap** (plain configs) & **Secret** (encrypted keys) |
| **Storage Persistence** | Docker volume | **PersistentVolumeClaim (PVC)** mapped to persistent disk blocks |
| **Database Migrations** | `command: sh -c "alembic..."` | **InitContainer** (guarantees migrations complete before app starts) |

---

## 2. Directory Structure

```text
k8s/
├── 01-config.yaml      # Secret (DB password, JWT key) + ConfigMap (DB URL, algorithm)
├── 02-postgres.yaml    # PVC (1Gi) + Deployment (1 replica) + ClusterIP Service (port 5432)
├── 03-backend.yaml     # Deployment (2 replicas + InitContainer) + LoadBalancer Service (port 8000)
├── 04-frontend.yaml    # Deployment (2 replicas) + LoadBalancer Service (port 3000 -> 80)
└── README.md           # Quick setup instructions
```

---

## 3. Step-by-Step Manifest Explanations

### A. Configurations & Secrets (`01-config.yaml`)
- **`Secret`**: Stores sensitive keys (`SECRET_KEY`, `POSTGRES_PASSWORD`).
- **`ConfigMap`**: In Kubernetes, the internal connection string is:
  ```
  postgresql+psycopg://postgres:<PASSWORD>@postgres-svc:5432/employee_db
  ```
  `postgres-svc` is the internal DNS name managed by Kubernetes CoreDNS.

### B. Database (`02-postgres.yaml`)
- **`PersistentVolumeClaim (PVC)`**: Ensures database state is preserved across Pod restarts or node rescheduling.
- **`Service (ClusterIP)`**: Exposes port `5432` only inside the cluster. No external/internet access for security.

### C. Backend (`03-backend.yaml`)
- **`replicas: 2`**: Distributes two instances across different cluster nodes.
- **`initContainers`**: Runs `alembic upgrade head`. The main FastAPI container will **not start** until database migrations succeed.
- **`readinessProbe`**: Pings `GET /` every 10 seconds; stops routing traffic if a pod becomes unresponsive.
- **`Service (LoadBalancer)`**: Distributes inbound traffic evenly across all ready backend pods on `http://localhost:8000`.

### D. Frontend (`04-frontend.yaml`)
- **`replicas: 2`**: High-availability Nginx web servers.
- **`Service (LoadBalancer)`**: Maps host port `3000` to container port `80`.

---

## 4. How to Load Local Images into Multi-Node K8s Nodes

When testing on local multi-node clusters (Docker Desktop / Kind), nodes run inside isolated containerd runtimes and cannot read host images automatically (`ErrImageNeverPull`).

Use the direct image-streaming pipes without needing Docker Hub:

```bash
# 1. Tag & build images locally
docker tag employee-mgmt-container:latest employee-backend:latest
docker build -t employee-frontend:latest ./frontend

# 2. Stream into both Kubernetes nodes
docker save employee-backend:latest | docker exec -i desktop-worker ctr -n k8s.io images import -
docker save employee-backend:latest | docker exec -i desktop-control-plane ctr -n k8s.io images import -

docker save employee-frontend:latest | docker exec -i desktop-worker ctr -n k8s.io images import -
docker save employee-frontend:latest | docker exec -i desktop-control-plane ctr -n k8s.io images import -
```

---

## 5. Daily Kubernetes Commands Cheatsheet

### Deploying & Updating
```bash
# Deploy all manifests in order
kubectl apply -f k8s/

# Deploy a specific file
kubectl apply -f k8s/03-backend.yaml

# Restart a deployment (picks up new image/config with zero downtime)
kubectl rollout restart deployment backend-deployment
kubectl rollout restart deployment frontend-deployment
```

### Monitoring & Status Inspection
```bash
# View all running pods, services, and deployments
kubectl get all

# View pods with IP addresses and host node assignments
kubectl get pods -o wide

# Inspect why a pod is failing (events, crash logs, mount errors)
kubectl describe pod <pod-name>
```

### Viewing Logs
```bash
# Stream logs of all backend replicas simultaneously
kubectl logs -l app=backend -c backend -f

# View the migration InitContainer logs
kubectl logs -l app=backend -c run-migrations

# Stream frontend logs
kubectl logs -l app=frontend -f

# Stream postgres logs
kubectl logs -l app=postgres -f
```

### Scaling & Self-Healing Demonstrations
```bash
# Scale backend from 2 to 5 instances
kubectl scale deployment backend-deployment --replicas=5

# Watch Kubernetes automatically distribute them
kubectl get pods -l app=backend -o wide

# Test self-healing: manually kill a pod
kubectl delete pod <pod-name>
kubectl get pods   # K8s will have instantly spawned a replacement pod!
```

### Clean Teardown
```bash
# Delete all resources created by manifests
kubectl delete -f k8s/
```

---

## 6. Access Endpoints

| Component | URL | Handled By |
| :--- | :--- | :--- |
| **Frontend React App** | `http://localhost:3000` | `frontend-svc` (LoadBalancer) |
| **Backend Swagger Docs** | `http://localhost:8000/docs` | `backend-svc` (LoadBalancer) |
| **Backend Health Check** | `http://localhost:8000/` | `backend-svc` (LoadBalancer) |
