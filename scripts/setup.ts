#!/usr/bin/env npx tsx
/**
 * 微信公众号发布器 - 交互式安装引导
 * 
 * 用法: npx tsx setup.ts
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import * as readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
};

const log = {
  info: (msg: string) => console.log(`\x1b[34m[INFO]\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m[✓]\x1b[0m ${msg}`),
  warn: (msg: string) => console.log(`\x1b[33m[!]\x1b[0m ${msg}`),
  error: (msg: string) => console.log(`\x1b[31m[✗]\x1b[0m ${msg}`),
};

async function main() {
  console.log('\n========================================');
  console.log('  微信公众号发布器 - 安装引导');
  console.log('========================================\n');

  const scriptDir = resolve(__dirname);
  const envFile = resolve(scriptDir, '.env');
  const envExample = resolve(scriptDir, '.env.example');

  // 检查依赖
  log.info('检查依赖...');
  
  if (!existsSync(resolve(scriptDir, 'node_modules'))) {
    log.info('安装 npm 依赖...');
    try {
      execSync('npm install --silent', { cwd: scriptDir, stdio: 'inherit' });
      log.success('依赖安装完成');
    } catch (error) {
      log.error('依赖安装失败，请手动运行: npm install');
      process.exit(1);
    }
  } else {
    log.success('依赖已安装');
  }

  // 检查配置文件
  console.log('\n----------------------------------------');
  console.log('  微信公众号配置');
  console.log('----------------------------------------\n');

  if (existsSync(envFile)) {
    const envContent = readFileSync(envFile, 'utf-8');
    const hasAppId = envContent.includes('WECHAT_APP_ID=') && !envContent.includes('WECHAT_APP_ID=你的');
    const hasSecret = envContent.includes('WECHAT_APP_SECRET=') && !envContent.includes('WECHAT_APP_SECRET=你的');
    
    if (hasAppId && hasSecret) {
      log.success('配置文件已存在且已配置');
      rl.close();
      showSuccess();
      return;
    }
  }

  // 创建配置文件
  if (!existsSync(envFile) && existsSync(envExample)) {
    writeFileSync(envFile, readFileSync(envExample, 'utf-8'));
    log.info('已创建 .env 配置文件');
  }

  console.log('请输入微信公众号配置：');
  console.log('（可在公众平台 → 开发 → 基本配置 中获取）\n');

  const appId = await question('AppID: ');
  const appSecret = await question('AppSecret: ');

  if (!appId || !appSecret) {
    log.warn('跳过配置，稍后可手动编辑 .env 文件');
    rl.close();
    showSuccess();
    return;
  }

  // 更新配置文件
  let envContent = existsSync(envFile) ? readFileSync(envFile, 'utf-8') : '';
  envContent = envContent.replace(/WECHAT_APP_ID=.*/, `WECHAT_APP_ID=${appId}`);
  envContent = envContent.replace(/WECHAT_APP_SECRET=.*/, `WECHAT_APP_SECRET=${appSecret}`);
  
  if (!envContent.includes('WECHAT_APP_ID=')) {
    envContent += `\nWECHAT_APP_ID=${appId}\nWECHAT_APP_SECRET=${appSecret}\n`;
  }

  writeFileSync(envFile, envContent);
  log.success('配置已保存');

  rl.close();
  showSuccess();
}

function showSuccess() {
  console.log('\n========================================');
  console.log('  ✅ 安装成功！');
  console.log('========================================\n');
  console.log('🚀 开始使用：\n');
  console.log('   在 OpenClaw 中说：');
  console.log('   "帮我生成一篇关于 XX 的公众号文章"\n');
  console.log('   或命令行使用：');
  console.log('   npx tsx publish-complete.ts articles/xxx.md\n');
}

main().catch(console.error);
