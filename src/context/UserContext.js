// UserContext.js
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../firebase'; // Adjust this import based on your setup
import { useAuth } from './AuthContext';
const UserContext = createContext();

export const useUser = () => {
  return useContext(UserContext);
};

const MAX_FREE_USES_PER_DAY = 3;

export const UserProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const [isFreeUser, setIsFreeUser] = useState(false);
  const [isPremiumUser, setIsPremiumUser] = useState(false);
  const [remainingUses, setRemainingUses] = useState(MAX_FREE_USES_PER_DAY);

  const checkUserPlan = useCallback(async (uid) => {
    try {
      const userDocRef = doc(firestore, 'users', uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        const userPlan = userData.plan || 'free';

        if (userPlan === 'free') {
          setIsFreeUser(true);
          await checkDailyUsage(userDocRef);
        } else if (['Yearly', 'Monthly', 'Weekly'].includes(userPlan)) {
          setIsPremiumUser(true);
        }
      }
    } catch (error) {
      console.error("Error fetching or creating user plan: ", error);
    }
  }, []);

  const checkDailyUsage = async (userDocRef) => {
    try {
      const userDoc = await getDoc(userDocRef);
      const usageData = userDoc.data().usage;

      if (usageData.date !== new Date().toDateString()) {
        // Reset usage count for a new day
        await updateDoc(userDocRef, { usage: { date: new Date().toDateString(), count: 0 } });
        setRemainingUses(MAX_FREE_USES_PER_DAY);
      } else {
        setRemainingUses(MAX_FREE_USES_PER_DAY - usageData.count);
      }
    } catch (error) {
      console.error("Error checking daily usage: ", error);
    }
  };

  const incrementUsageCount = async (userDocRef) => {
    try {
      const userDoc = await getDoc(userDocRef);
      const usageData = userDoc.data().usage;

      usageData.count += 1;
      await updateDoc(userDocRef, { usage: usageData });
      setRemainingUses(MAX_FREE_USES_PER_DAY - usageData.count);
    } catch (error) {
      console.error("Error incrementing usage count: ", error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      checkUserPlan(currentUser.uid);
    }
  }, [checkUserPlan,currentUser]);

  return (
    <UserContext.Provider value={{ isFreeUser, isPremiumUser, checkUserPlan, remainingUses, incrementUsageCount }}>
      {children}
    </UserContext.Provider>
  );
};
