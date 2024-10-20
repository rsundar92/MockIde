'use client';

import React from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import Skeleton from 'react-loading-skeleton';
import { Branch } from '@/types/type';
import { useBranches } from '@/context/BranchesContext';
import 'react-loading-skeleton/dist/skeleton.css';

export const IDEHeader: React.FC = () => {
  const { currentBranch, setBranch, localBranches, isLoadingBranches } = useBranches();

  return (
    <div className="p-4 border-b border-gray-200 z-[100]">
      {isLoadingBranches ? (
        <Skeleton height={40} width={'100%'} />
      ) : (
        <Select value={currentBranch} onValueChange={(value: string) => setBranch(value as Branch)}>
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {localBranches.map((branch) => (
              <SelectItem key={branch} value={branch}>
                {branch}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
