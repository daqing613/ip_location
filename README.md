# IP Location Finder

A simple web application to query location information by IP address. It provides both a web interface and API endpoints.

## Features

- Web interface to query location information by IP address
- API endpoint to get location data for a specific IP
- API endpoint to get the client's own IP address
- Responsive UI design

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ip_location
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory (optional):
```
PORT=3000
```

## Usage

### Start the application

```bash
# Start with Node.js
npm start

# Start with nodemon (auto-reload on changes)
npm run dev
```

### Web Interface

Open your browser and navigate to [http://localhost:3000](http://localhost:3000) to use the web interface.

### API Endpoints

#### Get location by IP address

```bash
curl http://localhost:3000/location/8.8.8.8
```

This will return location information for the specified IP address (8.8.8.8 in this example).

#### Get your own IP address

```bash
curl.exe -s http://localhost:3000/myip
```

This will return your current IP address as plain text (not JSON).

### 注意 (PowerShell 环境下)
在 Windows PowerShell 中，`curl` 是 `Invoke-WebRequest` 的别名，它会输出一个响应对象。如果需要仅查看纯文本响应，请使用以下命令之一：

```powershell
# 使用 curl.exe（原生 curl）并静默模式输出
curl.exe http://localhost:3000/myip

# 或使用 Invoke-RestMethod 直接获取文本内容
(Invoke-RestMethod http://localhost:3000/myip)
```

## Docker & Kubernetes Deployment

### Using Docker

```bash
# Build a Docker image
npm run docker:build

# Run the application in a Docker container
npm run docker:run
```

### Deploying to Azure Kubernetes Service (AKS)

This application can be deployed to Azure Kubernetes Service with Azure Container Registry. Follow the detailed guides in the docs folder:

1. [Azure Setup Guide](./docs/azure-setup.md) - How to set up Azure resources
2. [Azure Container Registry Usage Guide](./docs/acr-usage-guide.md) - How to use ACR to build and store Docker images
3. [CI/CD Guide](./docs/ci-cd-guide.md) - How to use GitHub Actions for CI/CD

#### Quick Start with ACR and AKS

After setting up Azure resources:

```bash
# Build and push Docker image to ACR
npm run acr:build-push

# Deploy to AKS
npm run aks:deploy
```

## Technologies Used

- Node.js
- Express.js
- Axios
- Docker & Kubernetes
- Azure Container Registry & Azure Kubernetes Service
- GitHub Actions for CI/CD
- ipinfo.io API for geolocation data

## License

ISC
