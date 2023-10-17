import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: {
                title: '主页'
            }
        },
        {
            path: '/profile',
            name: 'profile',
            // route level code-splitting
            // this generates a separate chunk (About.[hash].js) for this route
            // which is lazy-loaded when the route is visited.
            component: () => import('../views/ProfileView.vue'),
            meta: {
                title: '用户中心'
            }
        },
        {
            path: '/auth',
            name: 'auth',
            component: () => import('../views/AuthView.vue'),
            meta: {
                title: '用户认证'
            }
        }
    ]
});
router.afterEach((to, from) => {
    console.log(to);
    document.title = to.meta.title || 'PK File Manager';
});

export default router
