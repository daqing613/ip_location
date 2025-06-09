/**
 * 准备部署脚本
 * 此脚本用于替换 Kubernetes 配置文件中的变量
 */
const fs = require('fs');
const path = require('path');

// 获取环境变量
const acrLoginServer = process.env.ACR_LOGIN_SERVER || 'iplocationacr.azurecr.io';
const imageName = process.env.IMAGE_NAME || 'ip-location';
const imageTag = process.env.IMAGE_TAG || 'latest';
const domainName = process.env.DOMAIN_NAME || 'ip-location.example.com';

// 替换函数
function replaceVariables(filePath, variables) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 替换所有变量
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`\\$\\{${key}\\}`, 'g');
      content = content.replace(regex, variables[key]);
    });
    
    // 保存文件
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ 成功更新文件: ${filePath}`);
  } catch (error) {
    console.error(`❌ 处理文件时出错 ${filePath}:`, error);
    process.exit(1);
  }
}

// 主函数
function main() {
  console.log('🚀 开始准备 Kubernetes 部署文件...');
  
  const kubernetesDir = path.join(__dirname, '..', 'kubernetes');
  
  // 部署文件
  const deploymentFile = path.join(kubernetesDir, 'deployment.yaml');
    // 替换变量
  const variables = {
    CONTAINER_REGISTRY: `${acrLoginServer}/${imageName}`,
    IMAGE_TAG: imageTag,
    DOMAIN_NAME: domainName
  };
  
  // 检查文件是否存在
  if (fs.existsSync(deploymentFile)) {
    replaceVariables(deploymentFile, variables);
  } else {
    console.error(`❌ 文件不存在: ${deploymentFile}`);
    process.exit(1);
  }
  
  console.log('✅ Kubernetes 配置文件已成功准备。');
}

// 执行主函数
main();
