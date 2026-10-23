import {cookies} from 'next/headers';
import {getDb} from '@/db';
import {sessions} from '@/db/schema';
import {eq} from 'drizzle-orm';
import {cookieHeader,hashToken,sessionCookie} from '@/lib/admin-auth';
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Request origin rejected.'},{status:403});
 const token=(await cookies()).get(sessionCookie)?.value;
 if(token)await getDb().delete(sessions).where(eq(sessions.tokenHash,await hashToken(token)));
 return Response.json({ok:true},{headers:{'Cache-Control':'no-store','Set-Cookie':cookieHeader('',request,0)}});
}
