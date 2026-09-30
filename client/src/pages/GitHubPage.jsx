import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGitHubRepository } from '../services/githubService';
import './GitHubPage.css';

const EXTENSIONS = { js:'javascript',jsx:'javascript',ts:'typescript',tsx:'typescript',py:'python',java:'java',go:'go',c:'c++',cc:'c++',cpp:'c++',h:'c++',hpp:'c++' };
function GitHubPage(){
 const [url,setUrl]=useState(''); const [repo,setRepo]=useState(null); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const navigate=useNavigate();
 async function load(e){e.preventDefault();setLoading(true);setError('');setRepo(null);try{const r=await getGitHubRepository(url);setRepo(r.data);}catch(err){setError(err.message);}finally{setLoading(false);}}
 function reviewFile(file){const ext=file.path.split('.').pop().toLowerCase(); const language=EXTENSIONS[ext]||'javascript'; localStorage.setItem('githubReviewContext',JSON.stringify({repo:repo.name,path:file.path})); navigate('/',{state:{language,sourceCode:file.content,githubFile:file.path}});}
 return <div className="github-page"><header><p className="github-eyebrow">Repository analysis</p><h1>Review a GitHub repository</h1><p>Analyze source files from a public repository without leaving your workspace.</p></header><form className="github-form" onSubmit={load}><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://github.com/owner/repository" aria-label="GitHub repository URL"/><button disabled={loading||!url.trim()}>{loading?'Fetching…':'Fetch repository'}</button></form>{error&&<div className="github-error">{error}</div>}{repo&&<section className="repo-card"><div className="repo-heading"><div><h2>{repo.name}</h2><p>{repo.description||'No repository description.'}</p></div><span>{repo.branch}</span></div><div className="repo-note">Showing up to {repo.files.length} reviewable source files. Large/generated folders are skipped.</div><div className="repo-files">{repo.files.map(file=><button key={file.path} onClick={()=>reviewFile(file)}><span>{file.path}</span><strong>Review →</strong></button>)}</div>{!repo.files.length&&<p>No supported source files were found.</p>}</section>}</div>;
}
export default GitHubPage;
