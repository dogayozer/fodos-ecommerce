import fs from 'fs'
import path from 'path'

export interface FAQ {
  slug: string
  title: string
  date: string
  content: string
}

export function parseMarkdown(fileContent: string) {
  const frontmatterRegex = /---\n([\s\S]*?)\n---/
  const match = fileContent.match(frontmatterRegex)
  if (!match) return { data: {}, content: fileContent }
  
  const frontmatter = match[1]
  const data: any = {}
  frontmatter.split('\n').forEach(line => {
    const [key, ...values] = line.split(':')
    if (key) {
      let value = values.join(':').trim()
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1)
      }
      data[key.trim()] = value
    }
  })
  
  const markdownBody = fileContent.replace(match[0], '').trim()
  return { data, content: markdownBody }
}

export async function getAllFaqs(): Promise<FAQ[]> {
  const dir = path.join(process.cwd(), 'src/content/faq')
  if (!fs.existsSync(dir)) return []

  const files = fs.readdirSync(dir)
  const faqs: FAQ[] = []

  for (const file of files) {
    if (file.endsWith('.md')) {
      const filePath = path.join(dir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      const { data, content } = parseMarkdown(fileContent)
      
      faqs.push({
        slug: file.replace('.md', ''),
        title: data.title || '',
        date: data.date || '',
        content
      })
    }
  }

  // Sort by date or just leave it as is
  return faqs
}

export async function getFaqBySlug(slug: string): Promise<FAQ | null> {
  const filePath = path.join(process.cwd(), 'src/content/faq', `${slug}.md`)
  if (!fs.existsSync(filePath)) return null

  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = parseMarkdown(fileContent)
  
  return {
    slug,
    title: data.title || '',
    date: data.date || '',
    content
  }
}
