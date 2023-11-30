import { mount } from 'marketing/MarketingApp';
import React, { useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

export default () => {
  const ref = useRef(null);
  const history = useHistory();
  // console.log(typeof(mount));
  useEffect(() => {
    mount(ref.current, {
      onNavigate: ({pathname: nextPathname}) => {
        const {pathname} = history.location;
        if (pathname !== nextPathname) {
          history.push(nextPathname);
        }
      }
    });
  });

  return <div ref={ref} />;
};