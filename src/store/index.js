import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const axios = require('axios')
const URL = 'https://topdetal.ru/bitrix/components/magistral/personal.favorites.service/ajax.php'

export default new Vuex.Store({
    state: {
        carLog: {
            type: [],
            listPgn: {
                limit: 5, //элементов на странице
                page: 1, //номер страницы
                pages: 1, //всего страниц
            }
        },

    },
    actions: {

        //получение данных журнала
        async fetchCarLog(ctx, param) {

            const res = await axios.get(URL, {
                params: {
                    action: 'init',
                    CAR_ID: '5224',
                    limit: param.limit,
                    page: param.page,
                }
            });
            const carLog = await res.data;
            ctx.commit('updateCarLog', carLog);

        },

        //создание записи в журнале
        async createItemCarLog(ctx, newItem) {

			//собираем данные
			const params = new URLSearchParams();
			params.append('action', 'new_entry');
			params.append('UF_CAR_ID', ctx.getters.carLog.carId);
			params.append('UF_SERVICE_TYPE', newItem.type.id);
			params.append('UF_DATE', newItem.date );
			params.append('UF_PRICE', newItem.price );
			params.append('UF_MILEAGE', newItem.mileage );
			params.append('UF_DESCRIPTION', newItem.descr);


			const res = await axios.post(URL, params);
            const ans = await res.data;

            //запись успешно добавлена
            if(ans.success) {

                //обновляем список записей
                ctx.dispatch('fetchCarLog', {page: 1});

            }

            return ans;

        },

    },
    getters: {

        //вывод данных журнала
        carLog(state) {
            return state.carLog;
        },

    },
    mutations: {

        //запись данных журнала
        updateCarLog(state, carLog) {
            state.carLog = carLog;
        },

        //добавление записи в журнал
        addItemCarLog(state, newItem) {
            state.carLog.list.unshift(newItem);
        },

    },
    modules: {}
})