import React, { useState, useEffect } from 'react';

const useSkipFirstRender = (callback, dependencies = []) => {
  const [firstRender, setFirstRender] = useState(false);

  useEffect(() => {
    if (firstRender) {
      callback();
    } else {
      console.log('skip first render');
      setFirstRender(true);
    }
  }, [...dependencies]);
};

export default useSkipFirstRender;
