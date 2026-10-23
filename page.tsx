import ERP from "./erp";
import { getAdminOwner } from '@/lib/admin-auth';
import { redirect } from 'next/navigation';
export const dynamic="force-dynamic";
export default async function Page(){if(!await getAdminOwner())redirect('/login');return <ERP/>;}
