const ALLOWED_EXTENSIONS = new Set(['.js','.jsx','.ts','.tsx','.py','.java','.go','.cpp','.cc','.c','.h','.hpp']);
const IGNORE = /(^|\/)(node_modules|dist|build|coverage|\.git)(\/|$)/i;
const MAX_FILES = 12;
const MAX_FILE_SIZE = 70000;

function parseRepoUrl(value){
  try {
    const url = new URL(value.trim());
    if (url.hostname !== 'github.com') return null;
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], repo: parts[1].replace(/\.git$/,'') };
  } catch { return null; }
}

async function githubRequest(url){
  const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json', 'User-Agent': 'AI-Code-Reviewer' } });
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(data?.message || `GitHub request failed (${response.status}).`);
    error.statusCode = response.status === 404 ? 404 : 502;
    throw error;
  }
  return data;
}

async function getRepository(req,res,next){
  try {
    const parsed = parseRepoUrl(req.query.url || '');
    if (!parsed) { const e=new Error('Enter a valid public GitHub repository URL.'); e.statusCode=400; return next(e); }
    const repo = await githubRequest(`https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}`);
    const tree = await githubRequest(`https://api.github.com/repos/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/git/trees/${repo.default_branch}?recursive=1`);
    const files = (tree.tree || []).filter(x => x.type === 'blob' && !IGNORE.test(x.path) && ALLOWED_EXTENSIONS.has(x.path.slice(x.path.lastIndexOf('.')).toLowerCase()) && Number(x.size || 0) <= MAX_FILE_SIZE).slice(0,MAX_FILES);
    const results=[];
    for(const file of files){
      const raw = await fetch(`https://raw.githubusercontent.com/${encodeURIComponent(parsed.owner)}/${encodeURIComponent(parsed.repo)}/${encodeURIComponent(repo.default_branch)}/${file.path}`);
      if(!raw.ok) continue;
      const content = await raw.text();
      results.push({path:file.path,content:content.slice(0,MAX_FILE_SIZE)});
    }
    res.json({success:true,data:{name:repo.full_name,description:repo.description,branch:repo.default_branch,files:results,totalFiles:files.length,repositoryUrl:repo.html_url}});
  } catch(e){next(e);}
}
module.exports={getRepository};
