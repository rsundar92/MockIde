'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { Branch } from '@/types/type';

type BranchesContextType = {
  currentBranch: string;
  localBranches: string[];
  isLoadingBranches: boolean;
  error: Error | string | null;
  fetchBranches: () => void;
  setBranch: (branch: Branch) => void;
};

const BranchesContext = createContext<BranchesContextType | undefined>(undefined);

export const BranchesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentBranch, setCurrentBranch] = useState<Branch>(Branch.Dev);
  const [localBranches, setLocalBranches] = useState<string[]>([]);
  const [isLoadingBranches, setLoadingBranches] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const response = await axios.get('/branches.json');
      const data = response?.data?.data;
      setCurrentBranch(data?.currentBranch || '');
      setLocalBranches(data?.localBranches || []);
    } catch (error) {
      setError(error as unknown as Error | null | string);
    } finally {
      setLoadingBranches(false);
    }
  };

  const setBranch = (branch: Branch) => {
    setCurrentBranch(branch);
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  return (
    <BranchesContext.Provider
      value={{
        currentBranch,
        localBranches,
        isLoadingBranches,
        error,
        fetchBranches,
        setBranch,
      }}
    >
      {children}
    </BranchesContext.Provider>
  );
};

// Custom hook to use the BranchesContext
export const useBranches = () => {
  const context = useContext(BranchesContext);
  if (!context) {
    throw new Error('useBranches must be used within a BranchesProvider');
  }
  return context;
};
