import React, { useCallback, useRef, useState } from 'react';
import { trpc } from '../app/_trpc/client';

export const useSearchProblem = () => {

  const searchRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const ectTokenMutation = trpc.problem.getEctToken.useMutation();
  const getToken = async () => {
    return await ectTokenMutation.mutateAsync();
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>, callback?: any) => {
    setSearchQuery(e.target.value);
    callback?.('title', e.target.value);
  };

  const showSearchResults = !!(searchFocused && searchQuery);
  const handleSearchClickAway = useCallback(() => {
    if (showSearchResults) {
      setSearchFocused(false);
    }
  }, [showSearchResults]);

  const handleSelectProblem = (problem: any, callback?: any) => {
    setSearchQuery(problem.title);
    setSearchFocused(false);
    callback?.(problem);
  };

  const handleSearchFocus = useCallback(() => {
    setSearchFocused(true);
  }, []);

  return {
    searchRef,
    searchQuery,
    setSearchQuery,
    searchFocused,
    onChange,
    showSearchResults,
    handleSearchClickAway,
    handleSearchFocus,
    handleSelectProblem,
    getToken,
  };
};
