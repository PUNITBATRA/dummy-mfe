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
if instead of shared: ['faker'] we use object with add singleton true for loading 1 copy of module only no matter what. (show warning if different version specified) and if we use strictVersion true then shows error not warning.

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
medusa - open-source bidirectional micro-frontend framework built in Java.

Deployment types ->
Blue-green - check if working in production move whole 100% traffic to new release
canary releases - 33% to old version & 66% to new version or so.

Import maps provides low level building blocks. So by combining maps with Module federation we can build Native Federation (tooling agnostic) plugin kinda.
Module federation plugin works with webpack so now to make it browser native approach means with other bundlers import maps is coming as the next evolution step.So now for reimplementing module federation with import maps we need 3 things as Metadata (providing at compile time, loading at runtime), Bundling (remote, shared pkgs, angular compiler), import map (generate using metadata, scopes for version mismatches). This native ways works with Ecmascript module provided frameworks mainly for react etc it might be not that well..

So iframes not needed as MicroFE is there ?? -> No, if u still need good isolation iframe is the way to go.

Monolithic issues ->
Scaling gets costly, Changes often introduce errors, many people in one repo, rules & processes to avoid chaos.
How deep is your microfrontend? 

Pros of depth -
- Frontend only - Technology Independence (YES), Parallel Frontend Development (YES), Continuous Delivery (No- Dependency on BE etc), Autonomy level/waiting for others (need to Wait), Time to market (bicycle)
- Frontend + Backend (BFF- Data gathering) - Technology Independence (YES), Parallel Frontend Development (YES), Continuous Delivery (No- Dependency on BE etc).  Autonomy level/waiting for others (need to kind of Wait), Time to market (bike)
- Frontend + Backend (Business logic also) - Technology Independence (YES), Parallel Frontend Development (YES), Continuous Delivery (YES),  Autonomy level/waiting for others (No),  Time to market (super bike)
- Frontend + Backend + Ops - Technology Independence (YES), Parallel Frontend Development (YES), Continuous Delivery (YES),  Autonomy level/waiting for others (No),  Time to market (car)
- Full stack (Own ideas + test + learn)- Technology Independence (YES), Parallel Frontend Development (YES), Continuous Delivery (YES),  Autonomy level/waiting for others (No), Time to market (rocket)


Cons of depth - 
cross functional isn't easy, team has lot of responsibility, fullstack specialization needed, multiple small team needed 

Prepare for growth can be in two ways ->
1. start with n systems per team and split the teams if needed later like earlier 1 team working on 2 pages later 2 teams working on each seperately.
2. design system to be divided later like 1 team working on 1 page now need to divide page into 2 parts among 2 teams.

More systems = More integrations = More complexity

Let's say chat bot has message feature then prepopulated products list etc came then file upload so if we keep working as microfrontends in the same chatbot it can be an issue as it's just 1 chat bot and later on bug we might need to debug so UX is also important.

- Architecture principle for decoupling -> eventual consistency, async comm, no central coordination

- How to split microfrontends ->
by domain - sales team (checkout & payment page), recommendation team, customer team (new and returning customer pages)
by sections - header, footer, nav
by functionality - tiles, card, searchbox
by pages - (Prefered)

Pros/Cons of MFE ->
independent team -> Pros- isolated teams, reduce need for coordination with other team. Cons- assume vertical ownership of teams (ex- Customer data and api), everybody follow same rule like security, css scoping, compliance.
Code organisation -> Pros -CI/CD easier, less code to maintain. Cons- if shared app needed it become dumping ground, differnet version of pkg for the dependecy
Release independence -> Pros- can release seperately, rollback without affecting whole app. Cons- if require link b/w apps so independece reduces.
Test complexity reduces -> Pros- easy testing for small features. Cons- updating 1 app doesn't mean it won't break others, will take more time to architect the solution such that app independence is there.
Faster build times -> Pros- faster builds. Cons- multiple apps changes require multiple builds so overall more time.
Tech independence -> Pros- upgrade pkg easily, tech choose easily. Cons- multiple frameworks on one screen can crash device, can become complex (like more memory used for multiple frameworks) which lead to poor performance.

Tools, Patterns and frameworks ->
Mosaic -> address the breakdown of monolithic ui using fragments that are composed together at runtime
Module federation 
Single-spa -> use multiple framework on one page, support lazy loading
EEV -> event emitter for js, very small, 0 dependency, base app creates shared event folder, micro apps would publish events to this listener
NGINX -> use nginx as a webserver or reverse proxy to serve static content, route appropiate micro app based on path, better suited when there is navigation or app divided by features
iframe -> better when all functionality is on one page, require more isolation, communicate through dom, require iframe security to prevent iframe jacking
Custom orchestrator -> write your own tool to handle microfrontend orchestration

Testing ->
each app should have their own test suites, functional test b/w microapps happens at base level, keep tests focused on integration not business functionality, base test should only cover what isn't tested already 
Error handling ->
seperately for each app and error logging using splunk etc.


- Hydration is tree, resumability is map. resumability means recovering application's state without re-fetching resources. So, hydration makes static web pages interactive, while resumability lets users jump back in right where they stopped, making everything more convenient and user-friendly.

Qwik - No hydration, auto lazy-loading, edge-optimized, resumability..that allows serialization of components and event handlers in order to improve speed and performance.

It sounds scary but it's a good way to just frame it up mentally is always say try to build out a s/w in such a way where anything could chng anytime w/o notice that's like resilient s/w.

Symptoms for MFE ->
Application instability - app becomes fragile, lack of confidence while shipping new features, lack of failure isolation
Exponential growth - increasing devs and code, ci/cd & deployment become slow, difficulty scaling tech & org
Org Issues - lack of team ownership, require lot of context before making any chng, steep learning curve/larger codebases

* Monolith - most app start as monolith, single deployment unit, legacy bad reputation, monolith can also scale to million of users 
- full stack monolith - fe + be togeter, single deployment unit & data store, all code at 1 place (easy dev but slow dev when larger code, coupling, scalability and lack of flexibilty)
- frontend monolith - be moved out of monolith and fe comm with multiple services, spa (independent BE, benefits of spa ux/dx but still kinda as monolith)
- new monolith (new meta frameworks) - routing,service,auth features but again going back to make backend closer with frontend but with improved modularity (robust features, flexibility for BE arch mono/microservice but still it's a monolith)

* Modular Monolith - (Multiple UI folders), seperate concern and make code modular, single deployment unit, avoid complexity (more scalable, better code organisation, less complex than distributed arch But not fully independent, single deploy unit, large codebase)

* Integrated Application - Monorepo, build time compilation, modular, url & subdomain composition (increase independence, decoupled, deployed independent but compose at build time but limited independent deployment, single deploy unit, fragmented ui, bad ux)
 
* Microfrontend - independent, multiple deployment, test autonomy (Run time & build time)

History of JS ->
1995 (early adoption of js, introduce in netscape, used for adding simple interactivity to web apps, form validation,some animation) then 2005 (ajax, allowed to update content without reloading whole page) then 2006 (jquery, dom manipulation, event handling) then 2010 (MVC/MVW era - angular, ember, backbone etc) then 2013 (spa era - react,vue etc) then 2016 (angular 2.x, microfrontend) and future...
So basically from SSR Static HTML -> large files manual import -> js builder, minify browser common js -> webpack, lazy loading and SSR again so back to square 1 ???

Microfrontend are modular, tech agnoistic, independent ci/cd, scalabale, better ux.

Split the app as -> 
Domain driven design - based on specific business domain, each team on specific business area, complex integration due to different data req & process
multiple spa - each mfe is a spa, each team working on seperate spa, simple integration
microfrontend as component - can be more compicated as each mfe is seperate component responsible for distinct part of ui, integration depends on component design.

