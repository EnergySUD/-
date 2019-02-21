import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const scrollBehavior = (to, from, savedPosition) => {
	return new Promise((resolve, reject) => {
		if(savedPosition) {
			resolve(savedPosition)
		} else {
			const position = {}
			if(to.hash) {
				position.selector = to.hash
			}
			if(to.matched.some(m => m.meta.scrollToTop)) {
				position.x = 0
				position.y = 0
			}
			resolve(position)
		}
	})

}

export default new Router({
	scrollBehavior,
	routes: [{
			path: '/',
			name: 'index',
			component: () => import('./views/Index.vue'),
			meta: {
				scrollToTop: true
			}
		},
		{
			path: '/order',
			name: 'order',
			component: () => import('./views/Order.vue')
		},
		{
			path: '/more',
			name: 'more',
			component: () => import('./views/More.vue')
		}
	]
})