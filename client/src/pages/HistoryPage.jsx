import { useEffect, useState } from 'react';
import { getReviews, getReviewById, deleteReview } from '../services/reviewService';
import ReviewResult from '../components/ReviewResult';
import './HistoryPage.css';

function HistoryPage(){
 const [reviews,setReviews]=useState([]); const [selected,setSelected]=useState(null); const [status,setStatus]=useState('loading'); const [error,setError]=useState('');
 useEffect(()=>{getReviews().then(r=>{setReviews(r.data||[]);setStatus('ready'); const id=new URLSearchParams(location.search).get('review'); if(id) openReview(id);}).catch(e=>{setError(e.message);setStatus('error');});},[]);
 async function openReview(id){try{const r=await getReviewById(id);setSelected(r.data);}catch(e){setError(e.message);}}
 async function remove(id){if(!window.confirm('Delete this review permanently?')) return; try{await deleteReview(id);setReviews(x=>x.filter(r=>r._id!==id));if(selected?._id===id)setSelected(null);}catch(e){setError(e.message);}}
 return <div className="history-page"><header><div><p className="history-eyebrow">Review archive</p><h1>Review History</h1><p className="page-subtitle">Open any previous analysis to inspect its full findings and score breakdown.</p></div></header>{error&&<p className="error-message">{error}</p>}{status==='loading'&&<p className="page-subtitle">Loading…</p>}{status==='ready'&&!reviews.length&&<div className="empty-state"><h2>No reviews yet</h2><p>Run your first review to start building your history.</p></div>}{status==='ready'&&reviews.length>0&&<div className="history-layout"><div className="review-list">{reviews.map(r=><button className={`review-list-item ${selected?._id===r._id?'selected':''}`} key={r._id} onClick={()=>openReview(r._id)}><div><div className="review-meta"><span>{r.language}</span><strong>{r.score}/100</strong></div><p>{r.summary}</p><small>{new Date(r.createdAt).toLocaleString()}</small></div><span className="history-delete" onClick={(e)=>{e.stopPropagation();remove(r._id)}}>Delete</span></button>)}</div><div className="history-detail">{selected?<ReviewResult review={selected}/>:<div className="detail-placeholder"><h2>Select a review</h2><p>Choose a review from the list to see the complete analysis.</p></div>}</div></div>}</div>;
}
export default HistoryPage;
