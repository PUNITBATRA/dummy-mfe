import { mount } from 'dashboard/DashboardApp';
import React, { useRef, useEffect } from 'react';

export default () => {
  const ref = useRef(null);
  // console.log(typeof(mount));
  useEffect(() => {
    mount(ref.current)
  }, []);

  return <div ref={ref} />;
};