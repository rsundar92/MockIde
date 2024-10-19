'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import type { Worksheet } from '@/types/type';
import { useBranches } from './BranchesContext';

type OpenWorksheetsContextType = {
  activeWorksheets: Worksheet[];
  isLoadingWorksheets: boolean;
  error: Error | string | null;
  fetchWorksheets: () => void;
  updateWorksheets: () => void;
};

const OpenWorksheetsContext = createContext<OpenWorksheetsContextType | undefined>(undefined);

export const OpenWorksheetsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [activeWorksheets, setActiveWorksheets] = useState<Worksheet[]>([]);
  const [isLoadingWorksheets, setLoadingWorksheets] = useState(false);
  const [error, setError] = useState<Error | string | null>(null);
  const { currentBranch } = useBranches();

  const fetchWorksheets = useCallback(async () => {
    setLoadingWorksheets(true);
    try {
      const response = await axios.get('/open-worksheets.json');
      // Filter worksheets based on the currentBranch
      const filteredWorksheets = response.data.activeWorksheets.filter(
        (ws: Worksheet) => ws.branch === currentBranch
      );
      setActiveWorksheets(filteredWorksheets);
    } catch (error) {
      setError(error as unknown as Error | null | string);
    } finally {
      setLoadingWorksheets(false);
    }
  }, [currentBranch]); 

  const updateWorksheets = () => {
    // Logic to update the worksheets if necessary
  };

  useEffect(() => {
    fetchWorksheets();
  }, [fetchWorksheets]);

  return (
    <OpenWorksheetsContext.Provider
      value={{
        activeWorksheets,
        isLoadingWorksheets,
        error,
        fetchWorksheets,
        updateWorksheets,
      }}
    >
      {children}
    </OpenWorksheetsContext.Provider>
  );
};

export const useOpenWorksheets = () => {
  const context = useContext(OpenWorksheetsContext);
  if (!context) {
    throw new Error('useOpenWorksheets must be used within an OpenWorksheetsProvider');
  }
  return context;
};
