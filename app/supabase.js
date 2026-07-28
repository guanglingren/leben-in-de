const SUPABASE_URL="https://rjlplcqgrwmgehovnjev.supabase.co";
const SUPABASE_KEY="sb_publishable_BXBOJB2YK1S8vR4gyjGaDg_ua89X9vu";

const headers={
  apikey:SUPABASE_KEY,
  "Content-Type":"application/json"
};

async function request(path,options={}){
  const response=await fetch(`${SUPABASE_URL}/rest/v1/${path}`,{...options,headers:{...headers,...options.headers}});
  if(!response.ok)throw new Error(await response.text()||`Supabase ${response.status}`);
  if(response.status===204)return null;
  return response.json();
}

export async function getVisitCount(){
  const rows=await request("site_stats?id=eq.main&select=total_visits");
  return Number(rows?.[0]?.total_visits||0);
}

export async function registerVisit(){
  const count=await request("rpc/register_visit",{method:"POST",body:"{}"});
  return Number(count||0);
}

export async function getGuestbookMessages(){
  return request("guestbook?is_visible=eq.true&select=id,nickname,message,language,created_at&order=created_at.desc&limit=50");
}

export async function addGuestbookMessage({nickname,message,language}){
  const rows=await request("guestbook?select=id,nickname,message,language,created_at",{
    method:"POST",
    headers:{Prefer:"return=representation"},
    body:JSON.stringify({nickname,message,language})
  });
  return rows?.[0];
}
