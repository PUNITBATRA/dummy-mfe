import React from 'react';
import MarketingApp from './components/MarketingApp';
import {BrowserRouter} from 'react-router-dom';
import { StylesProvider, createGenerateClassName } from '@material-ui/core/styles';

import Header from './components/Header';

const generateClassName = createGenerateClassName({
  productionPrefix: 'co'
})
export default () => {
  return (
    <BrowserRouter>
    <StylesProvider generateClassName={generateClassName}>
    <div>
      <Header />
      <MarketingApp />
    </div>
    </StylesProvider>
    </BrowserRouter>
  );
};