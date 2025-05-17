import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface XPData {
  xp: number;
  level: number;
}

export function useXP() {
  const { data: session } = useSession();
  const [xpData, setXPData] = useState<XPData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchXP = async () => {
      if (!session?.user?.email) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/user/xp');
        if (response.ok) {
          const data = await response.json();
          setXPData(data);
        }
      } catch (error) {
        console.error('Error fetching XP:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchXP();
  }, [session?.user?.email]);

  const addXP = async (amount: number) => {
    if (!session?.user?.email) return;

    try {
      const response = await fetch('/api/user/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ xpAmount: amount }),
      });

      if (response.ok) {
        const data = await response.json();
        setXPData(data);
        return data;
      }
    } catch (error) {
      console.error('Error adding XP:', error);
    }
  };

  return {
    xp: xpData?.xp ?? 0,
    level: xpData?.level ?? 1,
    isLoading,
    addXP,
  };
} 