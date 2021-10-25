import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const axios = require('axios')

const AJAX_URL = 'https://topdetal.ru/bitrix/components/magistral/personal.favorites.service/ajax.php'
const AJAX_LIMIT = 10;

export default new Vuex.Store({
    state: {
        urlGet: false,
        formAdd: false,
        carLog: {
            type: [],
            list: [],
            listPgn: {
                limit: AJAX_LIMIT, //элементов на странице
                page: 1, //номер страницы
                pages: 1, //всего страниц
            }
        },
        carLogListLoad: false,

    },
    actions: {

        //получение данных журнала
        async fetchCarLog(ctx, page) {

            const carId = ctx.getters.urlGet.car_id;
            const limit = ctx.getters.carLog.listPgn.limit;

            ctx.commit('setCarLogListLoad', true);

            //если страница не передана берём по дефолту
            if(!page) page = ctx.getters.urlGet.page;

            const res = await axios.get(AJAX_URL, {
                params: {
                    action: 'init',
                    car_id: carId,
                    limit: limit,
                    page: page,
                }
            });
            const carLog = await res.data;
            ctx.commit('updateCarLog', carLog);
            ctx.commit('setCarLogListLoad', false);

        },

        //переход по пагинации записей
        pagenCarLog(ctx, page) {

            function setAttr(prmName, val) {

                let res = '',
                    d = location.href.split("#")[0].split("?"),
                    query = d[1];

                if(query) {
                    var params = query.split("&");
                    for(var i = 0; i < params.length; i++) {
                        var keyval = params[i].split("=");
                        if(keyval[0] != prmName) {
                            res += params[i] + '&';
                        }
                    }
                }
                res += prmName + '=' + val;
                history.pushState(null, null, '?' + res);
            }

            setAttr('page', page);

            ctx.dispatch('fetchCarLog', page);

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


			const res = await axios.post(AJAX_URL, params);
            const ans = await res.data;

            //запись успешно добавлена
            if(ans.success) {

console.log(newItem);

                ctx.commit('switchFormAdd', false);

                if(ctx.getters.carLog.listPgn.page == 1) {

                    //добавляем запись в массив
                    newItem.id = ans.id;
                    ctx.commit('addItemCarLog', newItem);
                }
                else {

                    //обновляем страницу
                    ctx.dispatch('fetchCarLog', 1);
                }

            }

            return ans;

        },

        //изминение записи в журнале
        async editItemCarLog(ctx, editItem) {

			//собираем данные
			const params = new URLSearchParams();
			params.append('action', 'edit_entry');
			params.append('id', editItem.id);
			params.append('UF_SERVICE_TYPE', editItem.type.id);
			params.append('UF_DATE', editItem.date );
			params.append('UF_PRICE', editItem.price );
			params.append('UF_MILEAGE', editItem.mileage );
			params.append('UF_DESCRIPTION', editItem.descr);


			const res = await axios.post(AJAX_URL, params);
            const ans = await res.data;

            //если сохранение не успешно
            if(!ans.success) {
                console.log(ans);
                alert(ans.html);
            }

        },

        //удаление записи в журнале
        async deleteItemCarLog(ctx, id) {

			//собираем данные
			const params = new URLSearchParams();
			params.append('action', 'del_entry');
			params.append('id', id);

			const res = await axios.post(AJAX_URL, params);
            const ans = await res.data;

            //запись успешно удалена
            if(ans.success) {

                //убираем элемент из списка
                ctx.commit('removeItemCarLog', id);

                const page = ctx.getters.carLogListPage;
                //обновляем текущую страницу
                ctx.dispatch('fetchCarLog', page);
            }

        },


    },
    getters: {

        //вывод url get параметров
        urlGet(state) {
            return state.urlGet;
        },

        //вывод данных журнала
        carLog(state) {
            return state.carLog;
        },

        //вывод данных журнала
        carLogList(state) {
            return state.carLog.list;
        },

        //вывод текущей страницы
        carLogListPage(state) {
            return state.carLog.listPgn.page;
        },

        //вывод признака загрузки списка записей
        carLogListLoad(state) {
            return state.carLogListLoad;
        },

        //отображение формы добавления
        showFormAdd(state){
            return state.formAdd;
        }

    },
    mutations: {

        //запись url get параметров
        updateGetUrl(state, obj) {
            state.urlGet = obj;
        },

        //запись данных журнала
        updateCarLog(state, carLog) {
            state.carLog = carLog;
        },

        setCarLogListLoad(state, value) {
            state.carLogListLoad = value;
        },

        //добавление записи в журнал
        addItemCarLog(state, newItem) {

            if(!state.carLog.list) {
                state.carLog.list = [];
                state.carLog.list.push(newItem);

            }
            else {
                state.carLog.list.unshift(newItem);
                state.carLog.list.splice(state.carLog.listPgn.limit, 1);                
            }
   
        },

        //удаляем элемент из журнала
        removeItemCarLog(state, id) {
            state.carLog.list.forEach(function(item, n){
                if(item.id == id) state.carLog.list.splice(n, 1);
            })
        },

        switchFormAdd(state, value) {
            state.formAdd = value;
        },

        switchPreDel(state, param) {

            if(param.val) {
                state.carLog.list.forEach(function(item){

                    if(item.id == param.id) {
                        item.preDel = param.val
                    }
                    else {
                        item.preDel = !param.val
                    }
                })
            }
            else {
                state.carLog.list.filter(function(item){
                    item.preDel = param.val
                    return item.id == param.id;
                })
            }

        },

        switchFormEdit(state, param) {
            state.carLog.list.forEach(function(item){

                if(item.id == param.id) {
                    item.edit = param.val
                }
                else {
                    item.edit = !param.val
                }
            })
        },

    },
    modules: {}
})