import { useEffect, useCallback } from 'react';

export function useInfiniteScroll(
  callback: () => void,
  element: HTMLElement | null,
  threshold = 100
) {
  const handleScroll = useCallback(() => {
    if (!element) return;

    const scrolledToBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < threshold;

    if (scrolledToBottom) {
      callback();
    }
  }, [callback, element, threshold]);

  useEffect(() => {
    if (!element) return;

    element.addEventListener('scroll', handleScroll);
    return () => element.removeEventListener('scroll', handleScroll);
  }, [element, handleScroll]);
}