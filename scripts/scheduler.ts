/**
 * 定时任务调度器
 * 
 * 支持在多个时段自动生成文章
 * 与 OpenClaw 的 cron 系统集成
 */

import type { PublisherConfig } from './config.js'

export interface ScheduleConfig {
  times: string[]      // 发布时间，如 ["08:00", "12:00", "18:00"]
  timezone: string     // 时区
  enabled: boolean     // 是否启用
  topics?: string[]    // 每个时间段的主题（可选）
}

export interface ScheduledTask {
  time: string
  topic: string
  cronExpression: string
}

// 将时间字符串转换为 cron 表达式
export function timeToCron(time: string): string {
  const [hours, minutes] = time.split(':').map(Number)
  // 格式: 分 时 * * * (每天)
  return `${minutes} ${hours} * * *`
}

// 生成 OpenClaw cron 配置
export function generateCronConfig(
  schedule: ScheduleConfig
): Array<{ cron: string; command: string }> {
  if (!schedule.enabled) {
    return []
  }

  const tasks: Array<{ cron: string; command: string }> = []
  
  schedule.times.forEach((time, index) => {
    const topic = schedule.topics?.[index] || `自动文章-${time}`
    const cronExpression = timeToCron(time)
    
    tasks.push({
      cron: cronExpression,
      command: `openclaw run "生成一篇关于"${topic}"的公众号文章"`
    })
  })
  
  return tasks
}

// 生成定时任务的提示信息
export function generateScheduleMessage(
  schedule: ScheduleConfig
): string {
  if (!schedule.enabled) {
    return '⏸️ 定时任务未启用'
  }

  const tasks = generateCronConfig(schedule)
  const lines = tasks.map((task, index) => {
    const time = schedule.times[index]
    const topic = schedule.topics?.[index] || '随机主题'
    return `  ${time} - ${topic}`
  })
  
  return `📅 定时任务已配置（${schedule.timezone}）：
${lines.join('\n')}

💡 添加以下内容到 OpenClaw 的 crontab：
${tasks.map(t => t.cron).join('\n')}`
}

// 根据当前时间判断是否应该生成文章
export function shouldGenerateNow(schedule: ScheduleConfig): boolean {
  if (!schedule.enabled) return false
  
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  
  // 检查当前时间是否在计划时间内（±5分钟容差）
  for (const scheduledTime of schedule.times) {
    const [scheduledHours, scheduledMinutes] = scheduledTime.split(':').map(Number)
    const [currentHours, currentMinutes] = currentTime.split(':').map(Number)
    
    const scheduledTotalMinutes = scheduledHours * 60 + scheduledMinutes
    const currentTotalMinutes = currentHours * 60 + currentMinutes
    
    if (Math.abs(scheduledTotalMinutes - currentTotalMinutes) <= 5) {
      return true
    }
  }
  
  return false
}

// 获取下一个生成时间
export function getNextGenerationTime(schedule: ScheduleConfig): string | null {
  if (!schedule.enabled || schedule.times.length === 0) return null
  
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  
  // 按时间排序
  const sortedTimes = [...schedule.times].sort((a, b) => {
    const [aH, aM] = a.split(':').map(Number)
    const [bH, bM] = b.split(':').map(Number)
    return (aH * 60 + aM) - (bH * 60 + bM)
  })
  
  // 找到下一个时间
  for (const time of sortedTimes) {
    const [h, m] = time.split(':').map(Number)
    const totalMinutes = h * 60 + m
    
    if (totalMinutes > currentMinutes) {
      return time
    }
  }
  
  // 如果今天没有了，返回明天的第一个
  return sortedTimes[0]
}

// 生成 HEARTBEAT.md 配置提示
export function generateHeartbeatConfig(
  schedule: ScheduleConfig
): string {
  return `# 微信公众号定时任务

## 自动生成文章
${schedule.times.map((time, index) => {
  const topic = schedule.topics?.[index] || '随机主题'
  return `- ${time}: 生成关于"${topic}"的文章`
}).join('\n')}

## 使用方法

### 方法1：通过 OpenClaw cron

在 OpenClaw 配置中添加：

\`\`\`json
{
  "crons": ${JSON.stringify(generateCronConfig(schedule), null, 2)}
}
\`\`\`

### 方法2：通过 HEARTBEAT

在 HEARTBEAT.md 中添加：

\`\`\`markdown
- 检查是否需要生成公众号文章
\`\`\`

然后在代码中检查 \`shouldGenerateNow()\`
`
}

// CLI 工具：显示定时任务状态
export function printScheduleStatus(config: PublisherConfig): void {
  const schedule: ScheduleConfig = {
    times: config.schedule.times,
    timezone: config.schedule.timezone,
    enabled: true
  }
  
  console.log('\n📅 定时任务配置\n')
  console.log(`时区: ${schedule.timezone}`)
  console.log(`时间段: ${schedule.times.join(', ')}`)
  
  const next = getNextGenerationTime(schedule)
  if (next) {
    console.log(`\n⏰ 下一次生成时间: ${next}`)
  }
  
  console.log('\n📝 Cron 表达式:')
  generateCronConfig(schedule).forEach(task => {
    console.log(`   ${task.cron}`)
  })
}
