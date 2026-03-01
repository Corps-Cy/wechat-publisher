/**
 * 微信公众号 API 封装
 * 
 * 支持功能：
 * - 获取 Access Token
 * - 上传图片素材
 * - 创建草稿
 * - 发布草稿
 * - 查询发布状态
 */

import * as crypto from 'crypto'

export interface WeChatConfig {
  appId: string
  appSecret: string
}

interface AccessTokenResponse {
  access_token: string
  expires_in: number
  errcode?: number
  errmsg?: string
}

interface MediaResponse {
  media_id: string
  url?: string
  errcode?: number
  errmsg?: string
}

interface DraftResponse {
  media_id: string
  errcode?: number
  errmsg?: string
}

interface PublishResponse {
  publish_id: string
  msg_data_id?: string
  errcode?: number
  errmsg?: string
}

// Access Token 缓存
let cachedToken: {
  token: string
  expiresAt: number
} | null = null

/**
 * 获取 Access Token（带缓存）
 */
export async function getAccessToken(config: WeChatConfig): Promise<string> {
  // 检查缓存
  if (cachedToken && cachedToken.expiresAt > Date.now()) {
    return cachedToken.token
  }

  const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.appId}&secret=${config.appSecret}`

  try {
    const response = await fetch(url)
    const data = await response.json() as AccessTokenResponse

    if (data.errcode) {
      throw new Error(`获取 Access Token 失败: ${data.errmsg} (${data.errcode})`)
    }

    // 缓存 token（提前 5 分钟过期）
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + (data.expires_in - 300) * 1000
    }

    console.log('✅ 获取 Access Token 成功')
    return data.access_token
  } catch (error) {
    console.error('❌ 获取 Access Token 失败:', error)
    throw error
  }
}

/**
 * 上传图片到微信服务器
 */
export async function uploadImage(
  accessToken: string,
  imagePathOrBuffer: string | Buffer,
  filename?: string
): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${accessToken}`

  try {
    let buffer: Buffer
    let name = filename || 'image.jpg'

    if (typeof imagePathOrBuffer === 'string') {
      const fs = await import('fs')
      buffer = fs.readFileSync(imagePathOrBuffer)
      name = imagePathOrBuffer.split('/').pop() || name
    } else {
      buffer = imagePathOrBuffer
    }

    // 构建 multipart/form-data
    const boundary = '----' + crypto.randomBytes(16).toString('hex')
    const formData = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="media"; filename="${name}"\r\n`),
      Buffer.from(`Content-Type: image/jpeg\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ])

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: formData
    })

    const data = await response.json() as MediaResponse

    if (data.errcode) {
      throw new Error(`上传图片失败: ${data.errmsg} (${data.errcode})`)
    }

    console.log(`✅ 图片上传成功: ${data.url}`)
    return data.url
  } catch (error) {
    console.error('❌ 上传图片失败:', error)
    throw error
  }
}

/**
 * 上传图文消息内的图片（永久素材）
 */
export async function uploadArticleImage(
  accessToken: string,
  imagePathOrBuffer: string | Buffer,
  filename?: string
): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/media/uploadimg?access_token=${accessToken}`

  try {
    let buffer: Buffer
    let name = filename || 'image.jpg'

    if (typeof imagePathOrBuffer === 'string') {
      const fs = await import('fs')
      buffer = fs.readFileSync(imagePathOrBuffer)
      name = imagePathOrBuffer.split('/').pop() || name
    } else {
      buffer = imagePathOrBuffer
    }

    // 获取 MIME 类型
    const getMimeType = (filename: string): string => {
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      }
      return mimeTypes[ext] || 'image/jpeg'
    }

    // 构建 multipart/form-data
    const boundary = '----' + crypto.randomBytes(16).toString('hex')
    const mimeType = getMimeType(name)
    
    const formData = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="media"; filename="${name}"\r\n`),
      Buffer.from(`Content-Type: ${mimeType}\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ])

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: formData
    })

    const data = await response.json() as MediaResponse

    if (data.errcode) {
      throw new Error(`上传图文图片失败: ${data.errmsg} (${data.errcode})`)
    }

    console.log(`✅ 图文图片上传成功: ${data.url}`)
    return data.url
  } catch (error) {
    console.error('❌ 上传图文图片失败:', error)
    throw error
  }
}

/**
 * 上传永久素材（用于封面）
 */
export async function uploadPermanentMaterial(
  accessToken: string,
  imagePathOrBuffer: string | Buffer,
  filename?: string,
  type: 'image' | 'thumb' = 'image'
): Promise<{ media_id: string; url: string }> {
  const url = `https://api.weixin.qq.com/cgi-bin/material/add_material?access_token=${accessToken}&type=${type}`

  try {
    let buffer: Buffer
    let name = filename || 'cover.jpg'

    if (typeof imagePathOrBuffer === 'string') {
      const fs = await import('fs')
      buffer = fs.readFileSync(imagePathOrBuffer)
      name = imagePathOrBuffer.split('/').pop() || name
    } else {
      buffer = imagePathOrBuffer
    }

    // 获取 MIME 类型
    const getMimeType = (filename: string): string => {
      const ext = filename.split('.').pop()?.toLowerCase() || 'jpg'
      const mimeTypes: Record<string, string> = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp'
      }
      return mimeTypes[ext] || 'image/jpeg'
    }

    // 构建 multipart/form-data
    const boundary = '----' + crypto.randomBytes(16).toString('hex')
    const mimeType = getMimeType(name)
    
    const formData = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="media"; filename="${name}"\r\n`),
      Buffer.from(`Content-Type: ${mimeType}\r\n\r\n`),
      buffer,
      Buffer.from(`\r\n--${boundary}--\r\n`)
    ])

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`
      },
      body: formData
    })

    const data = await response.json()

    if (data.errcode) {
      throw new Error(`上传永久素材失败: ${data.errmsg} (${data.errcode})`)
    }

    console.log(`✅ 永久素材上传成功`)
    console.log(`   Media ID: ${data.media_id}`)
    console.log(`   URL: ${data.url}`)
    
    return {
      media_id: data.media_id,
      url: data.url
    }
  } catch (error) {
    console.error('❌ 上传永久素材失败:', error)
    throw error
  }
}

/**
 * 创建草稿
 */
export async function createDraft(
  accessToken: string,
  articles: Array<{
    title: string
    author?: string
    content: string
    digest?: string
    content_source_url?: string
    thumb_media_id?: string
    need_open_comment?: number
    only_fans_can_comment?: number
  }>
): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/draft/add?access_token=${accessToken}`

  try {
    // 构建文章数据
    const articlesData = articles.map(article => {
      const data: any = {
        title: article.title,
        author: article.author || '',
        content: article.content,
        digest: article.digest || article.content.replace(/<[^>]+>/g, '').substring(0, 120),
        content_source_url: article.content_source_url || '',
        need_open_comment: article.need_open_comment || 0,
        only_fans_can_comment: article.only_fans_can_comment || 0
      }

      // 如果有封面图片 media_id，才添加这个字段
      if (article.thumb_media_id) {
        data.thumb_media_id = article.thumb_media_id
      } else {
        // 如果没有封面图片，使用一个默认的
        // 注意：这里需要提供一个有效的 media_id
        // 用户需要先上传一张封面图片到微信，获取 media_id
        console.log('⚠️  注意：草稿没有封面图片')
        console.log('💡 建议：先上传一张封面图片，然后重新发布')
        // 暂时使用一个空的 thumb_media_id
        data.thumb_media_id = ''
      }

      return data
    })

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        articles: articlesData
      })
    })

    const data = await response.json() as DraftResponse

    if (data.errcode) {
      // 提供更友好的错误提示
      if (data.errcode === 40007) {
        throw new Error(`创建草稿失败: 需要上传封面图片\n\n解决方案：\n1. 在公众号后台上传一张封面图片\n2. 或者先使用"复制 HTML"功能手动发布\n\n详细错误: ${data.errmsg} (${data.errcode})`)
      }
      throw new Error(`创建草稿失败: ${data.errmsg} (${data.errcode})`)
    }

    console.log(`✅ 草稿创建成功: ${data.media_id}`)
    return data.media_id
  } catch (error) {
    console.error('❌ 创建草稿失败:', error)
    throw error
  }
}

/**
 * 发布草稿
 */
export async function publishDraft(
  accessToken: string,
  mediaId: string
): Promise<string> {
  const url = `https://api.weixin.qq.com/cgi-bin/freepublish/submit?access_token=${accessToken}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        media_id: mediaId
      })
    })

    const data = await response.json() as PublishResponse

    if (data.errcode) {
      throw new Error(`发布草稿失败: ${data.errmsg} (${data.errcode})`)
    }

    console.log(`✅ 草稿发布成功: ${data.publish_id}`)
    return data.publish_id
  } catch (error) {
    console.error('❌ 发布草稿失败:', error)
    throw error
  }
}

/**
 * 查询发布状态
 */
export async function getPublishStatus(
  accessToken: string,
  publishId: string
): Promise<{
  publish_status: number
  article_id?: string
  fail_idx?: number[]
}> {
  const url = `https://api.weixin.qq.com/cgi-bin/freepublish/get?access_token=${accessToken}`

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        publish_id: publishId
      })
    })

    const data = await response.json()

    if (data.errcode) {
      throw new Error(`查询发布状态失败: ${data.errmsg} (${data.errcode})`)
    }

    return data
  } catch (error) {
    console.error('❌ 查询发布状态失败:', error)
    throw error
  }
}

/**
 * 完整发布流程
 */
export async function publishArticle(
  config: WeChatConfig,
  article: {
    title: string
    content: string
    author?: string
    digest?: string
  }
): Promise<{
  mediaId: string
  publishId: string
}> {
  console.log('\n🚀 开始发布文章到微信公众号...\n')

  // 1. 获取 Access Token
  console.log('1️⃣ 获取 Access Token...')
  const accessToken = await getAccessToken(config)

  // 2. 创建草稿
  console.log('2️⃣ 创建草稿...')
  const mediaId = await createDraft(accessToken, [{
    title: article.title,
    author: article.author || '',
    content: article.content,
    digest: article.digest
  }])

  // 3. 发布草稿
  console.log('3️⃣ 发布草稿...')
  const publishId = await publishDraft(accessToken, mediaId)

  console.log('\n✅ 文章发布成功！\n')
  console.log(`   草稿 ID: ${mediaId}`)
  console.log(`   发布 ID: ${publishId}`)

  return { mediaId, publishId }
}

/**
 * 仅创建草稿（不发布）
 */
export async function createDraftOnly(
  config: WeChatConfig,
  article: {
    title: string
    content: string
    author?: string
    digest?: string
  }
): Promise<string> {
  console.log('\n📝 创建草稿...\n')

  const accessToken = await getAccessToken(config)
  const mediaId = await createDraft(accessToken, [{
    title: article.title,
    author: article.author || '',
    content: article.content,
    digest: article.digest
  }])

  console.log('\n✅ 草稿创建成功！')
  console.log('   请在公众号后台查看并手动发布')

  return mediaId
}
