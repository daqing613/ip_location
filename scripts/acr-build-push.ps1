<#
.SYNOPSIS
    Build and push Docker image to Azure Container Registry
.DESCRIPTION
    This script helps build and push the IP Location app Docker image to Azure Container Registry
.PARAMETER ResourceGroup
    The Azure resource group name
.PARAMETER AcrName
    The Azure Container Registry name
.PARAMETER ImageName
    The name of the Docker image
.PARAMETER ImageTag
    The tag for the Docker image (defaults to latest)
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup,
    
    [Parameter(Mandatory=$true)]
    [string]$AcrName,
    
    [Parameter(Mandatory=$true)]
    [string]$ImageName,
    
    [Parameter(Mandatory=$false)]
    [string]$ImageTag = "latest"
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

# Get ACR Login Server
$acrLoginServer = az acr show --name $AcrName --resource-group $ResourceGroup --query loginServer -o tsv
if (-not $?) {
    Write-Host "Failed to get ACR login server. Make sure the ACR name and resource group are correct." -ForegroundColor Red
    exit 1
}

# Log in to ACR
Write-Host "Logging into ACR: $acrLoginServer" -ForegroundColor Cyan
az acr login --name $AcrName
if (-not $?) {
    Write-Host "Failed to log in to Azure Container Registry. Exiting." -ForegroundColor Red
    exit 1
}

# Build the Docker image
$fullImageName = "$acrLoginServer/$ImageName`:$ImageTag"
Write-Host "Building Docker image: $fullImageName" -ForegroundColor Cyan

docker build -t $fullImageName .
if (-not $?) {
    Write-Host "Failed to build Docker image. Exiting." -ForegroundColor Red
    exit 1
}

# Push the Docker image to ACR
Write-Host "Pushing Docker image to ACR: $fullImageName" -ForegroundColor Cyan
docker push $fullImageName
if (-not $?) {
    Write-Host "Failed to push Docker image to ACR. Exiting." -ForegroundColor Red
    exit 1
}

# Report success
Write-Host "Successfully built and pushed Docker image: $fullImageName" -ForegroundColor Green
Write-Host "You can deploy this image to your AKS cluster using:" -ForegroundColor Yellow
Write-Host "kubectl set image deployment/ip-location ip-location=$fullImageName -n <namespace>" -ForegroundColor Yellow
