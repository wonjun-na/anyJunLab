import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/loan',
      name: 'loan',
      component: () => import('../views/LoanCalculatorView.vue'),
    },
    {
      path: '/ddl',
      name: 'ddl',
      component: () => import('../views/DsrDtiLtvCalculatorView.vue'),
    },
    {
      path: '/addEng',
      name: 'addEng',
      component: () => import('../views/AddressEnglishConverter.vue'),
    },
  ],
})

export default router
