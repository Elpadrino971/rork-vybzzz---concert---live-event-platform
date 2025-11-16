import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import Loading from '@/components/Loading';

export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <Loading fullScreen text="Chargement..." />;
  }

  // Redirect to tabs if authenticated, otherwise to sign-in
  return <Redirect href={user ? '/(tabs)' : '/(auth)/sign-in'} />;
}
