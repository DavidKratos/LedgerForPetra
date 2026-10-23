import {getDb} from '@/db';
import {sessions,loginAttempts} from '@/db/schema';
import {eq,lt,sql} from 'drizzle-orm';
import {verifyAdmin,hashToken,cookieHeader} from '@/lib/admin-auth';
import {getChatGPTUser} from '@/app/chatgpt-auth';
import {env} from 'cloudflare:workers';
export const dynamic='force-dynamic';
const answer=(error:string,status:number)=>Response.json({error},{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 try{
  if(request.headers.get('origin')!==new URL(request.url).origin)return answer('Request origin rejected.',403);
  const body=await request.text();if(body.length>2048)return answer('Invalid login request.',400);
  const data=JSON.parse(body) as {username?:unknown;password?:unknown};
  if(typeof data.username!=='string'||typeof data.password!=='string'||data.username.length>100||data.password.length>256)return answer('Enter your username and password.',400);
  const db=getDb(),window=Math.floor(Date.now()/900000),bucket=`admin:${window}`;
  const [attempt]=await db.insert(loginAttempts).values({bucket,count:1}).onConflictDoUpdate({target:loginAttempts.bucket,set:{count:sql`${loginAttempts.count}+1`}}).returning();
  if(attempt.count>10)return answer('Too many login attempts. Try again in 15 minutes.',429);
  if(!await verifyAdmin(data.username,data.password))return answer('Incorrect username or password.',401);
  const token=Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
  const owner=env.LEDGERDESK_STANDALONE==='true'?'ledgerdesk-admin':(await getChatGPTUser())?.userId||'ledgerdesk-admin';
  await db.delete(sessions).where(lt(sessions.expires,Date.now()));
  await db.delete(loginAttempts).where(lt(loginAttempts.bucket,`admin:${window-1}`));
  await db.insert(sessions).values({tokenHash:await hashToken(token),owner,expires:Date.now()+8*60*60*1000});
  return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':cookieHeader(token,request,8*60*60)}});
 }catch{return answer('Unable to sign in. Please try again.',500);}
}
