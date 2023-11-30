import React, {lazy, Suspense} from 'react';
import {BrowserRouter, Switch, Route} from 'react-router-dom';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

import Header from './components/Header';

const MarketingLazy = lazy(()=> import('./components/MarketingApp'));
const AuthLazy = lazy(()=> import('./components/AuthApp'));

const generateClassName = createGenerateClassName({
  productionPrefix: 'co'
})
export default () => {
  return (
    <BrowserRouter>
    <StylesProvider generateClassName={generateClassName}>
    <div>
      <Header />
      <Suspense fallback={<div>loading...</div>}>
      <Switch>
        <Route path='/auth' component={AuthLazy} />
        <Route path='/' component={MarketingLazy} />
      </Switch>
      </Suspense>
    </div>
    </StylesProvider>
    </BrowserRouter>
  );
};