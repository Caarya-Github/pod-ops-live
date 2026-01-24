import { useAuth } from '@/contexts/AuthContext';

export function usePodAccess() {
  const { userProfile, isLead } = useAuth();

  const canAccessAllPods = isLead;

  const canAccessPod = (podCollegeId: string): boolean => {
    if (canAccessAllPods) return true;
    return userProfile?.college?._id === podCollegeId;
  };

  const getUserCollegeId = (): string | undefined => {
    return userProfile?.college?._id;
  };

  return {
    canAccessAllPods,
    canAccessPod,
    getUserCollegeId,
    userCollege: userProfile?.college,
    isLead,
  };
}
