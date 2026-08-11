import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

export function useRoleBase(): string {
  const { pathname } = useLocation();
  return useMemo(() => {
    const m = pathname.match(/^\/(parent|student|mentor)/);
    return m ? `/${m[1]}` : '';
  }, [pathname]);
}
