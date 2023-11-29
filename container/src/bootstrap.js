import {mount as productsMount} from 'products/ProductsIndex';
import {mount as cartMount} from 'cart/CartShow';

console.log('Container');
productsMount(document.querySelector('#my-mount-cart'))
cartMount(document.querySelector('#my-mount-products'))