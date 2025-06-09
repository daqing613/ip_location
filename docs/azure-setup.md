# Azure 服务主体设置指南

为了让 GitHub Actions 能够部署到 Azure Kubernetes Service (AKS)，您需要创建一个 Azure 服务主体，并将凭据保存为 GitHub 仓库密钥。

## 步骤 1: 安装和登录 Azure CLI

确保已安装 Azure CLI，并通过以下命令登录：

```bash
# 安装 Azure CLI (Windows 上使用 PowerShell)
Invoke-WebRequest -Uri https://aka.ms/installazurecliwindows -OutFile .\AzureCLI.msi
Start-Process msiexec.exe -Wait -ArgumentList '/I AzureCLI.msi /quiet'

# 登录 Azure
az login
```

## 步骤 2: 创建服务主体

执行以下命令创建具有贡献者角色的服务主体：

```bash
# 设置变量
$SUBSCRIPTION_ID=$(az account show --query id -o tsv)
$RESOURCE_GROUP="wprg001"  # 替换为您的资源组名称

# 创建服务主体并分配权限
az ad sp create-for-rbac --name "ip-location-sp" --role contributor --scopes /subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP --sdk-auth
```

该命令将输出类似于以下的 JSON：

```json
{
  "clientId": "<GUID>",
  "clientSecret": "<SECRET>",
  "subscriptionId": "<GUID>",
  "tenantId": "<GUID>",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

## 步骤 3: 创建 Azure Container Registry (ACR)

在 CI/CD 流程中，我们需要使用 Azure Container Registry 来存储应用程序的容器镜像：

```bash
# 创建 ACR
az acr create --resource-group wprg001 --name iplocationacr --sku Basic

# 启用管理员账户（用于 GitHub Actions 访问）
az acr update --name iplocationacr --admin-enabled true

# 获取 ACR 凭据
ACR_USERNAME=$(az acr credential show --name iplocationacr --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name iplocationacr --query "passwords[0].value" -o tsv)
echo "Username: $ACR_USERNAME"
echo "Password: $ACR_PASSWORD"
```

## 步骤 4: 在 GitHub 仓库中设置密钥

1. 在浏览器中打开您的 GitHub 仓库
2. 点击 "Settings" > "Secrets" > "Actions" > "New repository secret"
3. 添加以下密钥：
   - 名称: `AZURE_CREDENTIALS`，值: 第 2 步骤输出的 JSON
   - 名称: `ACR_USERNAME`，值: 第 3 步骤获取的 ACR 用户名
   - 名称: `ACR_PASSWORD`，值: 第 3 步骤获取的 ACR 密码
4. 点击 "Add secret" 保存每个密钥

## 步骤 5: 创建 AKS 集群（如果尚未创建）

如果您还没有 AKS 集群，可以通过以下命令创建：

```bash
# 创建资源组（如果还没有创建）
az group create --name wprg001 --location eastus

# 创建 AKS 集群
az aks create --resource-group wprg001 --name wpaks001 --node-count 3 --enable-addons monitoring --generate-ssh-keys --node-vm-size Standard_B2s

# 获取凭据
az aks get-credentials --resource-group wprg001 --name wpaks001

# 将 ACR 与 AKS 集群关联（授予 AKS 访问 ACR 的权限）
az aks update --name wpaks001 --resource-group wprg001 --attach-acr iplocationacr
```

## 步骤 6: 安装 NGINX Ingress Controller

```bash
# 添加 Helm 仓库
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# 安装 NGINX Ingress Controller
helm install nginx-ingress ingress-nginx/ingress-nginx --namespace ingress-basic --create-namespace
```

## 步骤 7: 安装 cert-manager 用于 HTTPS 证书

```bash
# 添加 Helm 仓库
helm repo add jetstack https://charts.jetstack.io
helm repo update

# 安装 cert-manager
helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --set installCRDs=true

# 创建 ClusterIssuer
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: danielwang461@gmail.com  # 替换为您的邮箱
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
    - http01:
        ingress:
          class: nginx
EOF
```

完成以上步骤后，CI/CD 配置将能够自动部署您的应用到 Azure Kubernetes Service。
