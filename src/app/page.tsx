import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    if (session.role === 'chief') {
      redirect('/admin');
    } else if (session.role === 'officer') {
      redirect('/officer/scan');
    } else if (session.role === 'participant') {
      redirect('/dashboard');
    }
  }

  return <LoginForm />;
}
