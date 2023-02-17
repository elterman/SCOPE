import { useState, useCallback } from 'react';

const useForceUpdate = (timeout: boolean) => {
  const [, setState] = useState<object>();
  const doSetState = () => setState({});

  return useCallback(() => {
    timeout && setTimeout(doSetState, 1);
    doSetState();
  }, [timeout]);
};

export default useForceUpdate;
