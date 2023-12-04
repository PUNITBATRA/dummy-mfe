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

Deployment ->
want to deploy each microfrontend independently including container.
location of child app remoteEntry.js files must be known at build time.
many FE solution assume we are deploying single project but we need to handle multiple. (need ci/cd)
currently remoteEntry.js file name is fixed need to think about caching issues.

for webpack.prod file in container we require index.html but not for REMOTE apps. So html webpack plugin we can move in webpack.commmon for container app.
After deployment if it's not working check the main.js file path and give appropiate public path in container & remote apps webpack.prod config.
Use Invalidation in yml files becoz if content changes cloudfront can't track as only name change file it can track.
create yml file for HOST & each REMOTE.

CSS Issue might occur in production.
Let's say user is in remote app 1 now navigates to remote app 2 it has css h1 green color and now navigate back to remote app 1 so it will also have green h1. So use css scoping.
CSS Scoping ->
if custom css we are writing (use a css in js library, namespace the css like .auth h1 etc.)
if css coming from a library (use a library that does css in js, manually build css lib and apply namespacing) 

- if two different projects using same css in js library then classname collison can occur. Like css in js library generates cls name as makestyles-herocontent-2 and in production to optimise long name it's like jss1, jss2 etc. hence collison in production. So use generateClassName. So, check in docs also but it's valid mostly for all and specifically to MUI.

Routing ->
- both host and remote apps need routing features (user can navigate to differnet subapps using routing logic built in container, user can navigate in subapp using routing logic build in subapp, not all subapp require routing)
- subapps might need to add in new pages/routes all the time (new route added to subapp doesn't require redeploy of container)
- we might need to show 2 or more micro FE at same time (this can occur if we have some sidebar nav built as seperate micro FE)
- we want to use off-the shelf routing solution (means already existing ones)
- we need navigation in subapps in both isolation and hosted mode (so that dev is easy)
- if different apps need to communicate info about routing it should be in a generic way (as different app might be using different navigation framework, changing/upgrading navigation library shouldn't require app rewrite)

History is (object to get & set the current path user is visiting) and router is (shows different content based on path). History is of 3 types. Browser History (everything after domain like xyz.com/abc/def), hash history (everything after hash like xyz.com#/abc/def), memory/abstract history (keep track of current path in memory)
- Common way is to use browser history in HOST app and memory history in REMOTE apps. If used browser history in both remote & host and then the url changes at same time so race condition occur and it might cause some issues.

- User clicks link governed by container (browser history) then communicate down to marketing then marketing memory history should update it's current path AND if User clicks link governed by marketing (memory history) then communicate up to container then container browser history should update it's current path (it's generic comm way)

- container have onNavigation props and marketing is using it now clicking on marketing should update memory history current path to /marketing and call onNavigate to update container that path is changed. So for child to container comm onNavigation prop is used.

- For container to child comm return from mount of child apps.
- For remote apps in isolation we will use browserHistory.

- publicPath is useful in dev as well like in auth app browser finding main.js at localhost:8082/auth/main.js but it's at localhost:8082/main.js so in isolation it works but now if we do so by container app and it require auth app and it loads remoteEntry.js file and now try to fetch main directly at same 8080 port means localhost:8080/main.js not at 8082/main.js so to fix this give localhost:8082/ complete path as public path. This wasn't issue in marketing app becoz IF PUBLIC PATH is never set scripts are loaded from the relative remoteEntry file but as and when nested routes and all come we require this. 

- We need to pass initialPath in history becoz otherwise it will think everytime it's at / and reroute to specific page will be done in second click and on specific route if we refresh it will start from /. So initialPath should be pass from mount and used in memoryHistory in remoteApps. 

- for handling auth there are 2 approaches each app is aware of auth and other is to centralise auth in container so second is better as it has less code duplicacy.

- getting access to browserHistory using <BrowserRouter> tag is tough so we should use <Router> tag with createBrowserHistory().

- cleanup functions can be as -
return () => {
      ReactDOM.unmountComponentAtNode(current)
      <!-- OR -> history.listen(onParentNavigate); -->
    }

--

With CRA ->
- Create CRA for host & remote app.
- in pkg.json start as webpack serve & create webpack config file, index.js, bootstrap.js and usual ModuleFederationPlugin setup for host & remote.
- we can create pkg.json for running all remote & host together at parent level.






___________

https://micro-frontends.org/

Properties of Microfrontends ->
dependency sharing, distributed UI fragments, isolation boundaries, distributed debugging, reusability, framework independent, composition target, tooling independent, distributed repositories, resiliant/tolerant
Piral - framework for build web apps that follow the microfrontends arch.
single-spa - A javascript router for front-end microservices

Deployment types ->
Blue-green - check if working in production move whole 100% traffic to new release
canary releases - 33% to old version & 66% to new version or so.
