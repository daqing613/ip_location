<#
.SYNOPSIS
    Test connection to Azure Container Registry
.DESCRIPTION
    This script tests the connection to Azure Container Registry
.PARAMETER ResourceGroup
    The Azure resource group name
.PARAMETER AcrName
    The Azure Container Registry name
#>
param(
    [Parameter(Mandatory=$true)]
    [string]$ResourceGroup,
    
    [Parameter(Mandatory=$true)]
    [string]$AcrName
)

Write-Host "Testing connection to Azure Container Registry: $AcrName" -ForegroundColor Cyan

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

# Get ACR information
Write-Host "Getting ACR information..." -ForegroundColor Cyan
$acrInfo = az acr show --name $AcrName --resource-group $ResourceGroup 2>$null
if (-not $?) {
    Write-Host "Failed to get ACR information. Make sure the ACR name and resource group are correct." -ForegroundColor Red
    exit 1
}

# Get ACR Login Server
$acrLoginServer = az acr show --name $AcrName --resource-group $ResourceGroup --query loginServer -o tsv
Write-Host "ACR Login Server: $acrLoginServer" -ForegroundColor Green

# Log in to ACR
Write-Host "Attempting to log in to ACR..." -ForegroundColor Cyan
az acr login --name $AcrName
if (-not $?) {
    Write-Host "Failed to log in to Azure Container Registry. Check your permissions." -ForegroundColor Red
    exit 1
}
Write-Host "Successfully logged in to ACR: $AcrName" -ForegroundColor Green

# Test if Docker is installed
Write-Host "Checking Docker installation..." -ForegroundColor Cyan
$dockerVersion = docker --version 2>$null
if (-not $?) {
    Write-Host "Docker is not installed or not in PATH. Please install Docker to push images to ACR." -ForegroundColor Red
    exit 1
}
Write-Host "Docker is installed: $dockerVersion" -ForegroundColor Green

Write-Host "ACR connection test completed successfully!" -ForegroundColor Green
Write-Host "You can now build and push images to $acrLoginServer" -ForegroundColor Cyan
