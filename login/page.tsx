import {redirect} from 'next/navigation';
import {getAdminOwner} from '@/lib/admin-auth';
import LoginForm from './login-form';
export const dynamic='force-dynamic';
export default async function LoginPage(){if(await getAdminOwner())redirect('/');return <LoginForm/>;}
