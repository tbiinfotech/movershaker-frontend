import React, { useState, useEffect } from 'react';

const useFirstRender = (callback, dependencies = []) => {
  const [firstRender, setFirstRender] = useState(true);

  useEffect(() => {
    if (firstRender) {
      callback();
      setFirstRender(false);
    } else {
      //   console.log('avoid all other renders');
    }
  }, [...dependencies]);
};

export default useFirstRender;
