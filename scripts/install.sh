#!/bin/bash
# ============================================================
# 微信公众号发布器 - 一键安装脚本
# ============================================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 检测 OpenClaw skills 目录
SKILLS_DIR="${OPENCLAW_SKILLS_DIR:-$HOME/.openclaw/workspace/skills}"
INSTALL_DIR="$SKILLS_DIR/wechat-publisher"

echo ""
echo "========================================"
echo "  微信公众号发布器 - 快速安装"
echo "========================================"
echo ""

# 检查是否已安装
if [ -d "$INSTALL_DIR/scripts/node_modules" ]; then
    log_info "检测到已安装，正在更新..."
    cd "$INSTALL_DIR"
    git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
    cd scripts
    npm install --silent
    log_success "更新完成！"
else
    log_info "安装目录: $INSTALL_DIR"
    
    # 检查 git
    if ! command -v git &> /dev/null; then
        log_error "需要 git，请先安装 git"
        exit 1
    fi
    
    # 检查 node
    if ! command -v node &> /dev/null; then
        log_error "需要 Node.js，请先安装 Node.js"
        exit 1
    fi
    
    # 创建目录
    mkdir -p "$SKILLS_DIR"
    
    # 克隆仓库
    log_info "正在克隆仓库..."
    if [ -d "$INSTALL_DIR" ]; then
        cd "$INSTALL_DIR"
        git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
    else
        git clone https://github.com/Corps-Cy/wechat-publisher.git "$INSTALL_DIR"
    fi
    
    # 安装依赖
    log_info "正在安装依赖..."
    cd "$INSTALL_DIR/scripts"
    npm install --silent
    
    log_success "安装完成！"
fi

# 检查配置文件
if [ ! -f "$INSTALL_DIR/scripts/.env" ]; then
    log_info "创建配置文件..."
    cp "$INSTALL_DIR/scripts/.env.example" "$INSTALL_DIR/scripts/.env"
    log_warn "请编辑 $INSTALL_DIR/scripts/.env 配置微信公众号凭证"
fi

# 创建测试文章
log_info "创建示例文章目录..."
mkdir -p "$INSTALL_DIR/scripts/articles"

echo ""
echo "========================================"
echo "  ✅ 安装成功！"
echo "========================================"
echo ""
echo "📋 下一步："
echo ""
echo "1. 配置微信公众号凭证："
echo "   编辑 $INSTALL_DIR/scripts/.env"
echo "   填入 WECHAT_APP_ID 和 WECHAT_APP_SECRET"
echo ""
echo "2. 在 OpenClaw 中使用："
echo "   \"帮我生成一篇关于 XX 的公众号文章\""
echo ""
echo "3. 命令行使用："
echo "   cd $INSTALL_DIR/scripts"
echo "   npx tsx publish-complete.ts articles/xxx.md"
echo ""
