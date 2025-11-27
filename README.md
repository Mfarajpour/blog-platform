#Multi-Tenant Blog Platform


##  Tech Stack
- **Backend:** Flask, PostgreSQL, Redis
- **Frontend:** Vue.js (CDN), Tailwind
- **Storage:** MinIO (S3 Compatible)
- **Infrastructure:** k3s, Helm, Nginx Ingress
- **GitOps:** ArgoCD
- **Observability:** Prometheus, Grafana

##  Endpoints
- **Blog:** http://blog.91.107.243.217.nip.io
- **ArgoCD:** http://argocd.91.107.243.217.nip.io
- **Grafana:** http://grafana.91.107.243.217.nip.io
- **MinIO:** http://minio.91.107.243.217.nip.io

##  Deployment
1. Ensure `k3s` is installed.
2. Install ArgoCD:
   ```bash
   kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
   ```
3. Apply the App Manifest:
   ```bash
   kubectl apply -f k8s/argocd-app.yaml
   ```

##  Developer Guide
1. Clone repo.
2. Run `docker-compose up` for local dev.
3. Push changes to `main` to trigger auto-deploy via ArgoCD.

