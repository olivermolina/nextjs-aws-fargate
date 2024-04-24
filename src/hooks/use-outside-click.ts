import { MutableRefObject, useEffect } from 'react';

function useOutsideClick(ref: MutableRefObject<any>, callback: () => void) {
  const handleClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  };

  useEffect(() => {
    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [ref, callback]); // Added dependencies
}

export default useOutsideClick;
