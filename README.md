Prevent direct communication b/w two SPAs as possible.
Integration ->
Build time/Compile time - Before container gets loaded in browser it gets access to MFE source code. (by npm pkg. pros- easy, cons- redeploy on every update, tightly coupled)
Run time/Client side - After. (deploy at static urls /product.js, container is loaded on xyz.com and hence container app fetched products and executes it. pros- different version of MFE can be deployed and container can choose which one to chose, cons- tooling & setup complicated)
Server side - while sending down js to load up container, server decides whether to include MFE source code or not.

HTML-Webpack-plugin -> simplify process of serving html files to webpack bundles as on each compilation different hash files created. Adds appropiate scripts tag in index.html 

Integration steps->
Take 1 app as HOST & 1 as REMOTE. In remote decides modules u want to expose. Setup MF plugin to expose those files. In HOST decides which file u want to get from REMOTE. Setup MF to fetch those files.In Host refactor entrypoint to load async and import whatever files u need from remote. 


___________

https://micro-frontends.org/

Properties of Microfrontends ->
dependency sharing, distributed UI fragments, isolation boundaries, distributed debugging, reusability, framework independent, composition target, tooling independent, distributed repositories, resiliant/tolerant
Piral - framework for build web apps that follow the microfrontends arch.
single-spa - A javascript router for front-end microservices

Deployment types ->
Blue-green - check if working in production move whole 100% traffic to new release
canary releases - 33% to old version & 66% to new version or so.
