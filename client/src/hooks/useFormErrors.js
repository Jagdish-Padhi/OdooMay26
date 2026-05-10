import { useState, useCallback } from 'react';

export function useFormErrors(rules) {
  const [errors, setErrors] = useState({});

  const validate = useCallback(
    (values) => {
      const next = {};
      for (const [field, rule] of Object.entries(rules)) {
        const msg = rule(values[field] ?? '', values);
        if (msg) next[field] = msg;
      }
      setErrors(next);
      return Object.keys(next).length === 0;
    },
    [rules],
  );

  const clearError = useCallback((field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => setErrors({}), []);

  return { errors, validate, clearError, clearAll };
}