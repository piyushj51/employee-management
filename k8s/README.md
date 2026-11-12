# Local Kubernetes Testing Guide (Docker Desktop / Kind)

This directory contains the production-style Kubernetes manifests for the Employee Management application.

---

## 1. Prerequisites: Enable Kubernetes in Docker Desktop

1. Open **Docker Desktop**.
2. Click **Settings (Gear icon)** -> **Kubernetes**.
3. Check **"Enable Kubernetes"** and click **Apply & restart**.
4. Test that the cluster is ready:
   ```bash
   kubectl get nodes
   ```
   *(Status should be `Ready`)*

---

## 2. Build the Local Docker Images

Kubernetes will pull images directly from your local Docker daemon because we configured `imagePullPolicy: Never`.

Ensure both backend and frontend images are built:

```bash
# Backend image (already built earlier, but if you need to rebuild):
docker build --network=host -t employee-mgmt-container:latest .

# Frontend image:
docker build -t employee-frontend:latest ./frontend
```

---

## 3. Deploy to Kubernetes

Deploy all resources in one command:

```bash
kubectl apply -f k8s/
```

This creates:
- **`app-secrets` & `app-config`**: Secrets and configuration
- **`postgres-pvc`**: Persistent storage volume claim
- **`postgres-deployment` & `postgres-svc`**: Database pod and internal DNS service (`postgres-svc:5432`)
- **`backend-deployment` & `backend-svc`**: 2 Backend replicas with an **initContainer** running `alembic upgrade head`
- **`frontend-deployment` & `frontend-svc`**: 2 Frontend replicas

---

## 4. Check Status & Pods

Check all resources:
```bash
kubectl get all
```

Check the pods distributing across the cluster:
```bash
kubectl get pods -o wide
```

View logs of a backend pod:
```bash
kubectl logs -l app=backend -c backend -f
```

View migration initContainer logs:
```bash
kubectl logs -l app=backend -c run-migrations
```

---

## 5. Access the Applications

In Docker Desktop Kubernetes, `type: LoadBalancer` automatically binds to `localhost`:

- **Frontend App**: `http://localhost:80` (or `http://localhost`)
- **Backend API Docs**: `http://localhost:8000/docs`

---

## 6. Test Kubernetes Scaling

Scale backend pods from 2 to 5 replicas dynamically:
```bash
kubectl scale deployment backend-deployment --replicas=5
kubectl get pods -l app=backend
```

Simulate a crash (delete a pod and watch K8s instantly recreate it):
```bash
kubectl delete pod <pod-name>
kubectl get pods
```

---

## 7. Teardown / Clean Up

Delete all Kubernetes resources created:
```bash
kubectl delete -f k8s/
```
