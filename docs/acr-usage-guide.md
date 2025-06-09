# Azure Container Registry 使用指南

本指南详细介绍如何使用 Azure Container Registry (ACR) 构建、存储和部署 IP Location 应用的 Docker 镜像。

## 前提条件

- 已安装 Azure CLI
- 已安装 Docker
- 已安装 Node.js 和 npm
- 已安装 PowerShell 7+

## 准备工作

确保您已完成 [Azure 服务主体设置指南](./azure-setup.md) 中的步骤，创建了 Azure 资源组、Azure Container Registry 和 Azure Kubernetes Service 集群。

## 使用 npm 脚本管理构建与部署

本项目已经配置了多个 npm 脚本，简化了构建和部署过程：

### 构建并推送 Docker 镜像到 ACR

```powershell
# 构建并推送标记为 latest 的镜像
npm run acr:build-push

# 构建并推送使用 package.json 中版本号的镜像（如 v1.0.0）
npm run acr:build-push:version
```

### 部署应用到 AKS

```powershell
# 部署 latest 版本到 AKS
npm run aks:deploy

# 部署特定版本（基于 package.json 中的版本）到 AKS
npm run aks:deploy:version
```

## 手动执行构建与部署步骤

如果您需要更精细的控制或自定义参数，可以直接使用脚本：

### 构建并推送镜像

```powershell
# 基本用法
pwsh -File .\scripts\acr-build-push.ps1 -ResourceGroup ip-location-rg -AcrName iplocationacr -ImageName ip-location

# 指定自定义标签
pwsh -File .\scripts\acr-build-push.ps1 -ResourceGroup ip-location-rg -AcrName iplocationacr -ImageName ip-location -ImageTag v1.2.3
```

### 部署到 AKS

```powershell
# 基本用法
pwsh -File .\scripts\deploy-to-aks.ps1 -ResourceGroup ip-location-rg -AksClusterName ip-location-cluster -AcrName iplocationacr -ImageName ip-location

# 自定义部署
pwsh -File .\scripts\deploy-to-aks.ps1 -ResourceGroup custom-rg -AksClusterName custom-aks -AcrName custom-acr -ImageName ip-location -ImageTag v1.2.3 -Namespace custom-ns -DomainName custom.example.com
```

## 查看部署状态

部署完成后，您可以通过以下命令检查部署状态：

```powershell
# 确保已获取 AKS 凭据
az aks get-credentials --resource-group ip-location-rg --name ip-location-cluster --overwrite-existing

# 查看部署
kubectl get deployment ip-location -n ip-location-ns

# 查看 Pod
kubectl get pods -n ip-location-ns

# 查看服务和入口
kubectl get svc,ingress -n ip-location-ns
```

## 故障排除

### 镜像拉取问题

如果您的 Pod 无法启动并显示 `ImagePullBackOff` 错误，请检查：

1. ACR 是否已经与 AKS 关联：
   ```powershell
   az aks update --name ip-location-cluster --resource-group ip-location-rg --attach-acr iplocationacr
   ```
   
2. 镜像路径是否正确：
   ```powershell
   kubectl describe pod <pod-name> -n ip-location-ns
   ```

### 访问应用问题

如果您无法通过域名访问应用，请检查：

1. Ingress 控制器是否正确安装：
   ```powershell
   kubectl get pods -n ingress-basic
   ```
   
2. DNS 是否已正确配置指向 Ingress 控制器的外部 IP：
   ```powershell
   kubectl get service nginx-ingress-ingress-nginx-controller -n ingress-basic
   ```

3. TLS 证书是否已正确配置：
   ```powershell
   kubectl get certificate -n ip-location-ns
   ```

## 持续集成与部署

您也可以使用项目中配置好的 GitHub Actions 工作流进行持续集成与部署。详情请参阅 [CI/CD 使用指南](./ci-cd-guide.md)。
