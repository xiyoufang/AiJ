import Vue from 'vue'
import Vuex from 'vuex'
import VueRouter from 'vue-router'
import Element from 'element-ui'
import App from './App'
import Foo from './Foo'
import Bar from './Bar'

Vue.use(VueRouter)
Vue.use(Element)
Vue.use(Vuex)

const router = new VueRouter({
    routes: [
        {path: '/foo', component: Foo},
        {path: '/bar', component: Bar}
    ]

})

const publicState = {
    name: 'Vue'
}

const store = new Vuex.Store({
    state: {
        title: '游戏后台管理系统',
        author: 'xiyoufang@yeah.net'
    },
    getters: {
        getTitle: function (state) {
            return state.title;
        }
    }

})

new Vue({
    router: router,
    store,
    data: function () {
        return {publicState: publicState}
    },
    render: function (h) {
        return h(App)
    }
}).$mount('#app')
