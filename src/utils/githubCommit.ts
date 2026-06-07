const GITHUB_API = 'https://api.github.com';

function getHeaders(): HeadersInit {
  return {
    'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28'
  };
}

function getRepoPath(): string {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  return `${GITHUB_API}/repos/${owner}/${repo}`;
}

export async function readJsonFile<T>(filePath: string): Promise<T> {
  const url = `${getRepoPath()}/contents/${filePath}`;
  const response = await fetch(url, { headers: getHeaders() });
  
  if (!response.ok) {
    if (response.status === 404) {
      // Return empty array/object for non-existent files
      return ([] as unknown) as T;
    }
    throw new Error(`Failed to read ${filePath}: ${response.statusText}`);
  }
  
  const data = await response.json();
  const content = Buffer.from(data.content, 'base64').toString('utf-8');
  return JSON.parse(content) as T;
}

export async function updateJsonFile<T>(
  filePath: string,
  mutator: (data: T) => T,
  commitMessage: string,
  maxRetries = 5
): Promise<T> {
  const url = `${getRepoPath()}/contents/${filePath}`;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    // Read current file
    const getResponse = await fetch(url, { headers: getHeaders() });
    
    let currentData: T;
    let sha: string | undefined;
    
    if (getResponse.ok) {
      const fileData = await getResponse.json();
      sha = fileData.sha;
      const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
      currentData = JSON.parse(content) as T;
    } else if (getResponse.status === 404) {
      currentData = ([] as unknown) as T;
    } else {
      throw new Error(`Failed to read ${filePath}: ${getResponse.statusText}`);
    }
    
    // Mutate
    const newData = mutator(currentData);
    const newContent = Buffer.from(JSON.stringify(newData, null, 2)).toString('base64');
    
    // Commit
    const body: Record<string, string> = {
      message: commitMessage,
      content: newContent,
    };
    
    if (sha) {
      body.sha = sha;
    }
    
    const putResponse = await fetch(url, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body)
    });
    
    if (putResponse.ok) {
      return newData;
    }
    
    if (putResponse.status === 409) {
      // Conflict - retry
      await new Promise(resolve => setTimeout(resolve, 200 * (attempt + 1)));
      continue;
    }
    
    throw new Error(`Failed to update ${filePath}: ${putResponse.statusText}`);
  }
  
  throw new Error(`Failed to update ${filePath} after ${maxRetries} retries`);
}

export function generateUniqueId(length = 12): string {
  const chars = '0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function generateRecordId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}
