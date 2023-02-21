import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import HomePage from '../views/HomePage.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/list'
  },
  {
    path: '/',
    component: HomePage,
    children: [
      {
        path: '',
        redirect: '/list'
      },
      {
        path: 'signatures',
        name: 'Signatures',
        component: () => import('../views/ListPage.vue')
      },
      {
        path: '/pdf/:id',
        name: 'Pdf',
        component: () => import('../views/pdfs/PdfViewerPage.vue')
      },
      {
        path: '/add',
        name: 'AddPdf',
        component: () => import('../views/pdfs/addPdfPage.vue')
      },
      {
        path: '/list',
        name: 'List',
        component: () => import('../views/pdfs/ListPdfPage.vue')
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
