import { createRouter, createWebHistory } from "vue-router";

const files = import.meta.glob('/src/pages/learnThree/*.vue', {eager: true})
const routes = Object.keys(files).map(path => {
  const fileName = path.split('/').pop().replace(/\.vue$/, '')
  return {
    path: `/${fileName}`,
    component: files[`${path}`].default || files[`${path}`]
  }
})

export default createRouter({
  history: createWebHistory(),
  routes
})
