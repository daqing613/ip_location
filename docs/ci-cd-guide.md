# CI/CD 使用指南

本指南详细介绍如何使用 GitHub Actions 和 Azure 服务实现 IP Location 应用的持续集成与部署 (CI/CD)。

## 工作流概览

项目使用 GitHub Actions 实现 CI/CD 工作流，主要包括以下阶段：

1. **构建与测试**：检出代码、安装依赖、运行代码检查和测试
2. **构建与推送镜像**：构建 Docker 镜像并推送到 Azure Container Registry
3. **部署到 AKS**：将应用部署到 Azure Kubernetes Service

## 前提条件

在使用 CI/CD 之前，您需要：

1. 完成 [Azure 服务主体设置指南](./azure-setup.md) 中的所有步骤
2. 在 GitHub 仓库中配置必要的密钥

## GitHub 密钥配置

在您的 GitHub 仓库中，需要配置以下 Actions 密钥：

| 密钥名称 | 描述 |
|---------|------|
| `AZURE_CREDENTIALS` | 从 Azure 服务主体创建获取的 JSON 凭据 |
| `ACR_USERNAME` | Azure Container Registry 的用户名 |
| `ACR_PASSWORD` | Azure Container Registry 的密码 |

配置步骤：

1. 打开 GitHub 仓库
2. 进入 "Settings" > "Secrets and variables" > "Actions"
3. 点击 "New repository secret"
4. 添加以上三个密钥

## CI/CD 工作流文件

CI/CD 配置在 `.github/workflows/ci-cd.yml` 文件中定义，当代码推送到 `main` 分支或创建 Pull Request 时会触发。

### 环境变量

工作流使用以下环境变量：

```yaml
env:
  ACR_RESOURCE_GROUP: ip-location-rg
  ACR_NAME: iplocationacr
  IMAGE_NAME: ip-location
  AZURE_CREDENTIALS: ${{ secrets.AZURE_CREDENTIALS }}
  AKS_CLUSTER_NAME: ip-location-cluster
  AKS_RESOURCE_GROUP: ip-location-rg
  NAMESPACE: ip-location-ns
  DOMAIN_NAME: ip-location.example.com
```

如果您使用的资源名称不同，请相应地修改工作流文件中的环境变量。

## 手动触发 CI/CD

除了通过推送代码触发 CI/CD 外，您还可以手动触发工作流：

1. 打开 GitHub 仓库
2. 点击 "Actions" 标签页
3. 从左侧列表选择 "CI/CD Pipeline"
4. 点击 "Run workflow" 按钮
5. 选择要使用的分支，然后点击 "Run workflow"

## 监控部署

您可以在 GitHub Actions 页面监控 CI/CD 流程的进度和状态。成功完成后，可以通过配置的域名访问应用。

## 自定义 CI/CD 工作流

如需自定义 CI/CD 流程，请修改 `.github/workflows/ci-cd.yml` 文件。可以自定义的方面包括：

- 添加更多测试步骤
- 配置不同的部署环境（如开发、测试、生产）
- 添加通知配置（如邮件、Slack）
- 调整触发条件（如特定文件更改时触发）

示例 - 添加不同环境的部署：

```yaml
# 添加环境配置示例（请根据实际需求修改 .github/workflows/ci-cd.yml）
jobs:
  # ...现有配置...
  
  deploy-to-dev:
    # 开发环境部署
    needs: build-and-push
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    environment: development
    # ...部署步骤...
  
  deploy-to-prod:
    # 生产环境部署
    needs: build-and-push
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    # ...部署步骤...
```

## 故障排除

### 常见问题

1. **认证失败**：
   - 检查 GitHub 密钥是否正确配置
   - 确认服务主体权限是否有效
   - 检查 Azure 资源名称是否与工作流文件中的环境变量匹配

2. **镜像构建失败**：
   - 检查 Dockerfile 是否有错误
   - 确认构建上下文是否正确

3. **部署失败**：
   - 检查 Kubernetes 配置文件是否有效
   - 确认 AKS 集群是否可访问
   - 检查资源配额是否充足

### 查看详细日志

如遇问题，可以在 GitHub Actions 页面点击失败的作业，展开相应步骤查看详细日志，帮助诊断问题。

## 最佳实践

1. 为每个功能使用单独的分支开发，通过 Pull Request 合并到主分支
2. 在 PR 中审查 CI 检查结果，确保代码质量
3. 对安全敏感信息使用仓库密钥
4. 定期审查和更新 CI/CD 配置，使其与项目需求保持一致
