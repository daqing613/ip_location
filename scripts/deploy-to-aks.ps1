<#
.SYNOPSIS
    Deploy IP Location application to Azure Kubernetes Service
.DESCRIPTION
    This script helps deploy the IP Location application to Azure Kubernetes Service
.PARAMETER ResourceGroup
    The Azure resource group name
.PARAMETER AksClusterName
    The Azure Kubernetes Service cluster name
.PARAMETER AcrName
    The Azure Container Registry name
.PARAMETER ImageName
    The name of the Docker image
.PARAMETER ImageTag
    The tag for the Docker image (defaults to latest)
.PARAMETER Namespace
    The Kubernetes namespace to deploy to (defaults to ip-location-ns)
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup,
    
    [Parameter(Mandatory=$true)]
    [string]$AksClusterName,
    
    [Parameter(Mandatory=$true)]
    [string]$AcrName,
    
    [Parameter(Mandatory=$true)]
    [string]$ImageName,
    
    [Parameter(Mandatory=$false)]
    [string]$ImageTag = "latest",
    
    [Parameter(Mandatory=$false)]
    [string]$Namespace = "ip-location-ns",
    
    [Parameter(Mandatory=$false)]
    [string]$DomainName = "ip-location.example.com"
)

# Ensure user is logged into Azure CLI
$loginStatus = az account show --query name -o tsv 2>$null
if (-not $?) {
    Write-Host "You need to log in to Azure first. Running 'az login'..." -ForegroundColor Yellow
    az login
    if (-not $?) {
        Write-Host "Failed to log in to Azure. Exiting." -ForegroundColor Red
        exit 1
    }
}

# Get AKS credentials
Write-Host "Getting AKS credentials for cluster $AksClusterName..." -ForegroundColor Cyan
az aks get-credentials --resource-group $ResourceGroup --name $AksClusterName --overwrite-existing
if (-not $?) {
    Write-Host "Failed to get AKS credentials. Exiting." -ForegroundColor Red
    exit 1
}

# Create namespace if it doesn't exist
Write-Host "Ensuring namespace $Namespace exists..." -ForegroundColor Cyan
kubectl create namespace $Namespace --dry-run=client -o yaml | kubectl apply -f -

# Get ACR Login Server
$acrLoginServer = az acr show --name $AcrName --resource-group $ResourceGroup --query loginServer -o tsv
if (-not $?) {
    Write-Host "Failed to get ACR login server. Make sure the ACR name and resource group are correct." -ForegroundColor Red
    exit 1
}

# Set environment variables for deployment preparation script
$env:ACR_LOGIN_SERVER = $acrLoginServer
$env:IMAGE_NAME = $ImageName
$env:IMAGE_TAG = $ImageTag
$env:DOMAIN_NAME = $DomainName

# Run the prepare-deployment script
Write-Host "Preparing Kubernetes manifests..." -ForegroundColor Cyan
npm run prepare-deployment
if (-not $?) {
    Write-Host "Failed to prepare deployment files. Exiting." -ForegroundColor Red
    exit 1
}

# Deploy to AKS
Write-Host "Deploying to AKS..." -ForegroundColor Cyan
kubectl apply -f kubernetes/deployment.yaml -n $Namespace
if (-not $?) {
    Write-Host "Failed to deploy to AKS. Exiting." -ForegroundColor Red
    exit 1
}

# Verify deployment
Write-Host "Verifying deployment..." -ForegroundColor Cyan
kubectl rollout status deployment/ip-location -n $Namespace
kubectl get services,deployments,pods -n $Namespace

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Application should be available at: https://$DomainName" -ForegroundColor Yellow
