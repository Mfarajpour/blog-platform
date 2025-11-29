
# 🚀 Enterprise Multi-Tenant Blog Platform

A production-grade DevOps showcase demonstrating a full CI/CD lifecycle using **GitLab CI**, **ArgoCD**, **Kustomize**, and **Kubernetes**.

## 🛠 Tech Stack
- **App:** Flask (Backend), Vue.js (Frontend), PostgreSQL, Redis
- **Storage:** MinIO (S3 Compatible)
- **Infrastructure:** k3s, Nginx Ingress, Helm
- **GitOps:** ArgoCD (Multi-Environment)
- **Manifest Management:** Kustomize (Base + Overlays)
- **Observability:** Prometheus, Grafana

---

## 🌍 Environments & Endpoints

| Environment | URL | Description |
|-------------|-----|-------------|
| **DEV**     | [http://dev.app.91.107.243.217.nip.io](http://dev.app.91.107.243.217.nip.io) | Auto-deployed on push to `develop` |
| **STAGE**   | [http://stage.app.91.107.243.217.nip.io](http://stage.app.91.107.243.217.nip.io) | Manual promotion from Dev |
| **PROD**    | [http://app.91.107.243.217.nip.io](http://app.91.107.243.217.nip.io) | Tag-triggered release (Manual Sync) |

### 🔧 Operational Tools
- **ArgoCD:** [http://argocd.91.107.243.217.nip.io](http://argocd.91.107.243.217.nip.io)
- **Grafana:** [http://grafana.91.107.243.217.nip.io](http://grafana.91.107.243.217.nip.io)
- **MinIO Console:** [http://minio.91.107.243.217.nip.io](http://minio.91.107.243.217.nip.io)

---

## 🔄 CI/CD Workflow

We use a strictly defined promotion flow:

1.  **Develop (DEV):**
    - Developer pushes code to `develop` branch.
    - **GitLab CI:** Builds images, updates `deploy/overlays/dev`, and pushes.
    - **ArgoCD:** Automatically syncs the DEV cluster.

2.  **Staging (STAGE):**
    - Triggered manually in GitLab CI (`promote-to-stage` job).
    - **GitLab CI:** Promotes the image tag from Dev to `deploy/overlays/stage`.
    - **ArgoCD:** Automatically syncs the STAGE cluster.

3.  **Production (PROD):**
    - Triggered by Git Tag (e.g., `git tag v1.0.0`).
    - **GitLab CI:** Updates `deploy/overlays/prod`.
    - **ArgoCD:** Shows "Out of Sync". Admin must click **SYNC** manually (Safety Gate).

---

## 📂 Project Structure (Kustomize)

```text
deploy/
├── base/                 # Common resources (Service, Deployment, ConfigMap)
├── overlays/
│   ├── dev/              # Dev config (1 replica, dev subdomain)
│   ├── stage/            # Stage config (2 replicas, stage subdomain)
│   └── prod/             # Prod config (3 replicas, main domain)
└── argocd/               # ArgoCD Application manifests
```

---

## 🚀 Quick Start (Infrastructure Setup)

1.  **Install ArgoCD:**
    ```bash
    kubectl create namespace argocd
    kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
    ```

2.  **Apply Applications:**
    This will create 3 apps in ArgoCD (Dev, Stage, Prod):
    ```bash
    kubectl apply -f deploy/argocd/applications.yaml
    ```

3.  **Access:**
    Open the URLs listed above.

---

## 👨‍💻 Developer Guide

1.  Create a feature branch: `git checkout -b feature/my-cool-feature`.
2.  Make changes and commit.
3.  Push and create a Merge Request to `develop`.
4.  Once merged, CI starts automatically.
```
