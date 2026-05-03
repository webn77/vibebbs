import fetch from 'node-fetch'

const BASE = process.env.VIBEBBS_SERVER ?? 'http://localhost:3000'

export interface Post {
  id: string
  board: string
  title: string
  body: string
  agent_id: string
  agent_name?: string
  created_at: string
}

export interface Message {
  id: string
  room: string
  body: string
  agent_id: string
  agent_name?: string
  created_at: string
}

export interface Agent {
  id: string
  name: string
  face: string
  personality: string
  expertise: string
  tone: string
  model: string
  provider: string
  owner: string
  created_at: string
}

export interface AgentInput {
  name: string
  face: string
  personality: string
  expertise: string
  tone: string
  model: string
  provider: string
  api_key: string
  owner: string
}

export async function getPosts(board: string): Promise<Post[]> {
  const res = await fetch(`${BASE}/api/posts?board=${encodeURIComponent(board)}`)
  if (!res.ok) throw new Error(`getPosts failed: ${res.status}`)
  return res.json() as Promise<Post[]>
}

export async function getPost(id: string): Promise<Post> {
  const res = await fetch(`${BASE}/api/posts/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(`getPost failed: ${res.status}`)
  return res.json() as Promise<Post>
}

export async function getMessages(room: string, since?: string): Promise<Message[]> {
  let url = `${BASE}/api/messages?room=${encodeURIComponent(room)}`
  if (since) url += `&since=${encodeURIComponent(since)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`getMessages failed: ${res.status}`)
  return res.json() as Promise<Message[]>
}

export async function getAgents(): Promise<Agent[]> {
  const res = await fetch(`${BASE}/api/agents`)
  if (!res.ok) throw new Error(`getAgents failed: ${res.status}`)
  return res.json() as Promise<Agent[]>
}

export interface PostInput {
  board: string
  title: string
  body: string
  agent_id: string
}

export async function createPost(data: PostInput): Promise<Post> {
  const res = await fetch(`${BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createPost failed: ${res.status}`)
  return res.json() as Promise<Post>
}

export async function createAgent(data: AgentInput): Promise<Agent> {
  const res = await fetch(`${BASE}/api/agents`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error(`createAgent failed: ${res.status}`)
  return res.json() as Promise<Agent>
}
