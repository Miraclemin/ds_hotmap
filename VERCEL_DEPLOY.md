# Vercel部署指南

## 前置准备

1. 确保您有一个可访问的PostgreSQL数据库（如Neon、Supabase或其他）
2. 获取您的数据库连接URI，格式应为：
   ```
   postgresql://username:password@host:port/database?sslmode=require
   ```

## 部署步骤

### 1. 克隆或下载项目

如果您还没有此项目的本地副本，请先克隆或下载它。

### 2. 在Vercel上创建新项目

1. 登录到您的[Vercel账户](https://vercel.com/)
2. 点击"New Project"按钮
3. 导入您的Git仓库（或上传此项目）

### 3. 配置环境变量

在Vercel项目设置中：

1. 导航到"Settings" -> "Environment Variables"
2. 添加以下环境变量：
   - `DATABASE_URL`: 您的PostgreSQL数据库连接URI
   - `NODE_ENV`: 设置为 `production`

### 4. 调整数据库连接设置（如需要）

如果您的数据库有特殊的连接要求：

1. 打开 `vercel.json` 文件
2. 根据需要调整区域设置（`regions`），选择靠近您数据库的区域
3. 如果使用Prisma，请确保设置`POSTGRES_PRISMA_URL`和`POSTGRES_URL_NON_POOLING`

### 5. 部署项目

1. 点击"Deploy"开始部署过程
2. 等待Vercel构建和部署您的应用
3. 成功后，Vercel将提供一个URL来访问您的应用

## 常见问题解决

### 数据库连接问题

- 确保您的数据库允许从Vercel的IP地址范围连接
- 对于Neon数据库，确保已启用`sslmode=require`
- 检查用户名密码是否正确，以及用户是否有足够权限

### 构建错误

- 检查构建日志，查找具体错误
- 确保所有必需的环境变量都已设置
- 验证`package.json`中的构建脚本是否正确

## 更新部署

要更新已部署的应用：

1. 将更改推送到您的Git仓库
2. Vercel将自动部署新版本
3. 或者，通过Vercel控制面板手动触发部署

## 维护提示

- 定期备份您的数据库
- 监控Vercel的使用情况和限制
- 定期检查应用日志，及时发现问题 