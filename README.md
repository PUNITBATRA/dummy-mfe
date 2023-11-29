Prevent direct communication b/w two SPAs as possible.
Integration ->
Build time/Compile time - Before container gets loaded in browser it gets access to MFE source code. (by npm pkg. pros- easy, cons- redeploy on every update, tightly coupled)
Run time/Client side - After. (deploy at static urls /product.js, container is loaded on xyz.com and hence container app fetched products and executes it. pros- different version of MFE can be deployed and container can choose which one to chose, cons- tooling & setup complicated)
Server side - while sending down js to load up container, server decides whether to include MFE source code or not.

HTML-Webpack-plugin -> simplify process of serving html files to webpack bundles as on each compilation different hash files created. Adds appropiate scripts tag in index.html 

Integration steps->
Take 1 app as HOST & 1 as REMOTE. In remote decides modules u want to expose. Setup MF plugin to expose those files. In HOST decides which file u want to get from REMOTE. Setup MF to fetch those files.In Host refactor entrypoint to load async and import whatever files u need from remote. 

index.html file of remote apps is not used while production only host app index.html file is used.

Shared modules ->
container fetches remoteEntryjs file from both products & cart and notices both require x pkg so container can load only 1 copy from either of them and single copy is made available to both products & cart. so use 'shared' but then isolated apps won't work becoz in index.js we are importing so async issue same as bootstrap.js.
if different versions of module used then even after shared both will load seperately. (major or etc basically module federation plugin compares as per ^/~ used in pkg.json)
if instead of shared: ['faker'] we use object with add singleton true for loading 1 copy of module only no matter what. (show warning if different version specified)

We are using id in index.html to render the app in REMOTE and same ids in HOST but if teams are in isolation it's not possible so in webpack config directly use bootstrap instead of index and use mount function kinda import export to solve that issue. Also for running in isolation we can add the condition.
id in index.html and webpack config name should not be same like cart, products etc becoz it creates that as var in remoteEntry file and we have same name id also in index.html hence error.

---
Microfrontend requirement ->
- zero coupling between child projects (no importing of function/obj/classes etc, no shared state, shared module is fine)
- near zero coupling between container and child projects (container shouldn't assume child is using xyz framework, any necessary comm done with callbacks/events like signup to login text change etc.)
- css from one project shouldn't affect another.
- version control shouldn't affect overall project (some people want to use monorepo, some want in seperate repo)
- container should be able to decide to always use the latest version of microfrontend/specify a specific version (container will always use the latest version of child app it doesn't require redeploy of container, container can specify exactly what version of child it wanna use it require redeploy).

devConfig/prodConfig has more priority than common config.
container app don't need mount function.
while using mount in container we can't use function directly so use it with useRef etc (as in components/MarketingApp)
instead of specific module shared array/object we can use directly from pkg.json.

___________

https://micro-frontends.org/

Properties of Microfrontends ->
dependency sharing, distributed UI fragments, isolation boundaries, distributed debugging, reusability, framework independent, composition target, tooling independent, distributed repositories, resiliant/tolerant
Piral - framework for build web apps that follow the microfrontends arch.
single-spa - A javascript router for front-end microservices

Deployment types ->
Blue-green - check if working in production move whole 100% traffic to new release
canary releases - 33% to old version & 66% to new version or so.
