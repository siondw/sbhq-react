import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header/Header';
import MainText from '../../components/MainText/MainText';
import UsernameInput from '../../components/UsernameInput/UsernameInput';
import styles from './VerificationScreen.module.css';
import { supabase } from '../../supabase';
import type { Role } from '../../types/sbhq';

function VerificationScreen() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [userHasUsername, setUserHasUsername] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [role, setRole] = useState<Role>(null);
  const hasFetchedData = useRef(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (hasFetchedData.current) return;
      hasFetchedData.current = true;

      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData?.session) {
          throw new Error('Failed to get current session');
        }

        const { user } = sessionData.session;
        setCurrentUserId(user.id);

        const { data, error } = await supabase
          .from('users')
          .select('username, role')
          .eq('id', user.id)
          .single<{ username: string | null; role: Role }>();

        if (error) throw new Error('Error checking user details in the database');

        setUserHasUsername(!!data?.username);
        setRole(data?.role ?? null);

        if (data?.username) {
          const redirectPath = data?.role === 'admin' ? '/admin' : '/join-contests';
          setTimeout(() => {
            navigate(redirectPath);
          }, 1000);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();

    return () => {
      hasFetchedData.current = false;
    };
  }, [navigate]);

  const handleUsernameSubmit = async (username: string) => {
    if (!currentUserId) {
      setError('Missing user information.');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('users')
        .update({ username })
        .eq('id', currentUserId);

      if (error) throw new Error('Failed to save username');

      const redirectPath = role === 'admin' ? '/admin' : '/join-contests';
      navigate(redirectPath);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.verificationScreen}>
      <div className={styles.header}>
        <Header />
      </div>
      <div className={styles.content}>
        {userHasUsername ? (
          <MainText
            header={`Welcome Back, ${role === 'admin' ? 'Admin' : 'User'}!`}
            subheader={`Redirecting you to ${role === 'admin' ? 'the admin dashboard' : 'your contests'}...`}
          />
        ) : (
          <>
            <MainText
              header="Set Your Username"
              subheader="Please choose a unique username to complete your profile."
            />
            <UsernameInput onSubmit={handleUsernameSubmit} />
          </>
        )}
        {error && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
}

export default VerificationScreen;
