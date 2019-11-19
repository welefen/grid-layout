import Vue from 'Vue';
import VueRouter from 'vue-router';
import ElementUI from 'element-ui';
import MountVessel from './main.vue';
import Aside from './aside.vue';
import Container from './container.vue';
// import PV from './pv/main.vue';
// import Referrer from './referrer/main.vue';
// import Status from './status/main.vue';
// import InternalError from './error/main.vue';

Vue.use(VueRouter);
Vue.use(ElementUI, {size: 'small'});

Vue.component('mount-vessel', MountVessel);
Vue.component('Aside', Aside);
Vue.component('Container', Container);

// /* 配置vue-router */
// const router = new VueRouter({
//   routes: [
//     {
//       path: '/pv',
//       component: PV
//     },
//     {
//       path: '/referrer',
//       component: Referrer
//     },
//     {
//       path: '/status',
//       component: Status
//     },
//     {
//       path: '/error',
//       component: InternalError
//     }
//   ]
// });
// window.router = router;

const instance = new Vue({
  el: '#fake-body',
  // router,
  components: {
    MountVessel
  }
});