import Vue from 'vue'

import Vuex from 'vuex'
import 'es6-promise/auto';
import axios from 'axios'
import VueAxios from 'vue-axios'
import vSelect from "vue-select";
import DatePicker from 'vue2-datepicker';

//сам объект
import App from './App.vue'
import store from './store'


Vue.config.productionTip = false

Vue.use(Vuex)
Vue.use(VueAxios, axios)
Vue.component('v-select', vSelect);
Vue.component('date-picker', DatePicker);

new Vue({
  store,
  render: h => h(App),
}).$mount('#app')
