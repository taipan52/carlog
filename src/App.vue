<template>
    <div id="app">
        <Form />

        <div class="td-carlog">

            <h3>Журнал обслуживания</h3>
            <span v-if="!showForm" class="td-carlog__btn add" @click="showForm = !showForm">Добавить запись</span>


            <!-- Форма добавления/редактирования записи -->
            <transition name="slide">
            <div v-if="showForm" class="td-carlog__form">

                <b class="td-carlog__form-title">Добавление записи</b>

                <div class="td-carlog__form-wrap">

                    <div class="td-carlog__form-left">
                        
                        <div class="td-carlog__form-type">

                            <v-select 
                                :options="carLog.type" 
                                :getOptionLabel="type => type.name"
                                :searchable="false"
                                :clearable="false"
                                placeholder="Выберите тип"
                                :value="add.type"
                                v-model="add.type"
                                >
                            
                                <template #selected-option="{id,name}">
                                    <span class="td-carlog__select-item selected"><i :class="'ico-'+id"></i>{{name}}</span>
                                </template>

                                <template #option="{id,name}">
                                    <span class="td-carlog__select-item"><i :class="'ico-'+id"></i>{{name}}</span>
                                </template>

                                <template #open-indicator={}>
                                    <span class="td-carlog__select-indicator" ref="openIndicator" role="presentation"></span>
                                </template>

                            </v-select>

                            <date-picker 
                                :lang="datePickerLang"
                                v-model="add.date" 
                                :editable="false"
                                :clearable="false"
                                title-format="DD MMMM YYYY"
                                format="DD.MM.YYYY">
                                    
                                <template #icon-calendar><span>d</span></template>

                            </date-picker>

                        </div>

                        <div class="td-carlog__form-number">
                            <label>
                                <input 
                                    class="inpt" 
                                    @input="changePrice"
                                    type="tel" 
                                    autocomplete="off" 
                                    placeholder="Сумма">
                                <span class="unit">руб.</span>
                            </label>
                            <label>
                                <input 
                                    class="inpt" 
                                    @input="changeMileage"
                                    type="tel" 
                                    autocomplete="off" 
                                    placeholder="Пробег">
                                    <span class="unit">км.</span>
                            </label>
                        </div>

                    </div>

                    <div class="td-carlog__form-right">
                        <div class="td-carlog__form-descr">
                            <label>Описание</label>
                            <textarea v-model="add.descr" placeholder="Описание"></textarea>
                        </div>				
                    </div>				
                </div>

                <!-- ЗАПЧАСТИ -->
                <div class="td-carlog__spare-select">
                    <span class="spare-select__item" v-for="item in spareSelectList" :key="item.ID">
                        {{item.PROPS.brand_title}} <b>{{item.PROPS.original_article}}</b> {{item.NAME}} - <b>{{item.PRICE}}</b>руб.
                        <i class="spare-select__item-delete" title="Удалить" @click="deleteAddSpareItem(item.ID)"></i>
                    </span>
                </div>

                <span v-if="!showFormSpare" class="td-carlog__btn spare-add" @click="getBasketItems()">
                    {{spareAddText}}
                    <i class="info">Запчасти будут выбраны из ваших заказов</i>
                </span>

                <div v-if="showFormSpare" class="td-carlog__spare">

                    <!-- фильтр -->
                    <div v-if="spare.list.length > 0" class="td-carlog__spare-filter">
                        <input v-model="spare.filter" type="text" placeholder="Начните вводить для фильтрации" @input="setSpareFilter">
                    </div>

                    <!-- список запчастей -->
                    <div class="td-carlog__spare-list" :class="{ blocked: spare.blocked }">

                        <div v-for="order in spare.list" :key="order.ID" class="td-carlog__spare-order" ref="spareOrder">
                            <b class="spare__order-title">Заказ {{order.ID}} ({{order.DATE_INSERT}}) на сумму {{order.PRICE}}руб.</b>
                            <div v-for="item in order.BASKET" :key="item.ID" class="td-carlog__spare-item">
                                <input :id="item.ID" type="checkbox" :value="item.ID" @change="setSpare($event, item)" :checked="item.CHECKED">
                                <label :for="item.ID">{{item.PROPS.brand_title}} <b>{{item.PROPS.original_article}}</b> {{item.NAME}} - <b>{{item.PRICE}}</b>руб.</label>
                            </div>						
                        </div>

                        <p v-if="spare.empty" class="td-carlog__spare-empty">Список ваших заказов пуст</p>

                        <span v-if="spare.more" class="td-carlog__btn spare-load" @click="loadBasketItems">Загрузить ещё</span>
            
                    </div>

                    <span class="td-carlog__btn spare-close" @click="spareClose">{{spareCloseText}}</span>
                    <span v-if="add.spareParts.length > 0" class="td-carlog__btn spare-reset" @click="spareReset">Сбросить</span>
                    
                </div>

                <p v-if="formError" class="td-carlog__descr error">{{formError}}</p>

                <div class="td-carlog__form-footer">
                    <span class="td-carlog__btn" @click="carlogAdd">Добавить</span>
                    <span class="td-carlog__btn cancel" @click="carlogAddCancel">Отмена</span>				
                </div>

            </div>
            </transition>

            <!-- список записей -->
            <div class="td-carlog__list">

                <transition-group name="entry" :duration="500" tag="div">
                <div v-for="item in carLog.list" :key="item.id" class="td-carlog__list-item">
                    <div class="name" :class="'ico-'+item.type.id">{{item.type.name}}</div>
                    <span class="date">{{item.date}}</span>
                    <span class="price">{{item.price}}</span>
                    <span class="mileage">{{item.mileage}}</span>
                    <span class="descr">{{item.descr}}</span>
                    <span class="td-carlog__btn" @click="carlogDel(item.id)">Удалить</span>
                    <span class="td-carlog__btn" @click="carlogEdit(item)">Изменить</span>

                    <ul v-if="item.basket.length > 0">
                        <li v-for="prod in item.basket" :key="prod.ID">{{prod.NAME}}</li>
                    </ul>

                </div>
                </transition-group>

            </div>

        </div>

    </div>

</template>

<script>

import Form from './components/form.vue'

const axios = require('axios');

const URL = 'https://topdetal.ru/bitrix/components/magistral/personal.favorites.service/ajax.php';
const store = {
    debug: false,
    data: {
		add:{
			type: {},
			date: new Date(),
			price: '',
			mileage: '',
			spareParts: [],
			descr: '',
			edit: false,
		},
		spare: {
			filter: '',
			list: [],
			blocked: false,
			more: false,
			empty: false,
			page: 0,
		},
        carLog: {},
		formError: '',
		showForm: false,
		showFormSpare: false,
		datePickerLang: {
			formatLocale: {
				months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
				monthsShort: ['Янв', 'Фев', 'Март', 'Апр', 'Май', 'Июнь', 'Июль', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
				weekdays: ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
				weekdaysShort: ['Вос', 'Пон', 'Втр', 'Срд', 'Чтв', 'Птн', 'Суб'],
				weekdaysMin: ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
				firstDayOfWeek: 1,				
			},
		},

    },
    setData(prop, value) {
        this.data[prop] = value;
    },
};


export default {
    name: 'App',
    components: {
        Form: Form
    },
    data(){
        return store.data;
    },

    created() {

    },

    computed: {

		spareAddText() {
			return this.add.spareParts.length > 0 ? 'Изменить запчасти' : 'Прикрепить запчасти';
		},

		spareCloseText() {
			return this.add.spareParts.length > 0 ? 'Сохранить' : 'Закрыть';
		},

        //Список выбранных запчастей
        spareSelectList() {
            let list = [];

            if(this.add.spareParts.length > 0 && this.spare.list.length > 0) {
                this.spare.list.forEach(function(order){
                    order.BASKET.forEach(function(item){
                        if(item.CHECKED) {
                            list.push(item);
                        }
                    });
                });
            }

            return list;
        }

        },
    
    mounted() {

        let self = this;

        axios
            .get(URL, {
                params: {
                    action: 'init',
                    CAR_ID: '5224',
                }
            })
            .then(function(res) {
                self.carLog = res.data;
                self.add.type = self.carLog.type[0];
            });

    },

    methods: {

		//очистка полей формы добавления записи
		clearAdd() {
			this.add = {
				type: this.carLog.type[0],
				date: new Date(),
				price: '',
				mileage: '',
				spareParts: [],
				descr: '',
			}
		},

		//ввод значения стоимости
		changePrice(e){

			let value = e.target.value;

			//убираем пробелы
			value = value.replace(/\s/g, '');
			//убираем не числа
			value = Number( value.replace (/\D/, '') );
			//форматируем
			if(value > 0) {
				value = value.toLocaleString('ru');
			}
			else {
				value = '';
			}


			this.add.price = e.target.value = value;
		},

		//ввод значения пробега
		changeMileage(e){
			let value = e.target.value;

			//убираем пробелы
			value = value.replace(/\s/g, '');
			//убираем не числа
			value = Number( value.replace (/\D/, '') );
			//форматируем
			if(value > 0) {
				value = value.toLocaleString('ru');
			}
			else {
				value = '';
			}

			this.add.mileage = e.target.value = value;
		},


		//ДОБАВЛЕНИЕ НОВОЙ ЗАПИСИ
		carlogAdd() {

			this.formError = false;

			let self = this,
				newItem = {
					id: '',
					type: this.add.type,
					date: this.add.date.toLocaleDateString('ru-RU'),
					price: this.add.price.replace (/\D/, ''),
					mileage: this.add.mileage.replace (/\D/, ''),
					descr: this.add.descr,
					basket: this.spareSelectList,
				};

			//собираем данные
			const params = new URLSearchParams();

			params.append('action', 'new_entry');
			params.append('UF_CAR_ID', this.carLog.carId);
			params.append('UF_SERVICE_TYPE', this.add.type.id);
			params.append('UF_DATE', this.add.date.toLocaleDateString('ru-RU') );
			params.append('UF_PRICE', this.add.price.replace (/\D/, '') );
			params.append('UF_MILEAGE', this.add.mileage.replace (/\D/, '') );
			params.append('UF_DESCRIPTION', this.add.descr);
			params.append('UF_BASKET_ITEMS', this.add.spareParts);



			axios.post(URL, params)
				.then(function (res) {
					
					//запись успешно добавлена
					if(res.data.success) {

						newItem.id = res.data.id;

						//добавляем новый элемент в список
						self.carLog.list.unshift(newItem);

						self.carlogAddCancel();

					}
					else {
						self.formError = res.data.html;
					}


				})
				.catch(function (error) {
					console.log(error);
				});


		},


		//ИЗМЕНЕНИЕ ЗАПИСИ
		carlogEdit() {

			this.showForm = true;
			this.edit = true;

		},

		//УДАЛЕНИЕ ЗАПИСИ
		carlogDel(id) {

			let self = this;

			//собираем данные
			const params = new URLSearchParams();

			params.append('action', 'del_entry');
			params.append('id', id);

			axios.post(URL, params)
				.then(function (res) {
					
					//запись успешно удалена
					if(res.data.success) {

						self.carLog.list.forEach(function(item, n){

							if(item.id == id) self.carLog.list.splice(n, 1);

						});


					}
					else {
						console.log(res.data.html);
					}


				})
				.catch(function (error) {
					console.log(error);
				});

		},


		//отмена добавления записи
		carlogAddCancel() {
			this.formError = false;
			this.showForm = false;
			this.clearAdd();
			this.spareReset();
			this.spareClose();
		},


		//получение списка товаров из заказа
		getBasketItems() {

			this.showFormSpare = true;

			if(this.spare.list.length == 0) {

				this.loadBasketItems();

			}

		},


		//получение заказов
		loadBasketItems() {

			this.spare.filter = '';

			//если не обнаружено, что заказов нет
			if(!this.spare.empty) {

				this.spare.blocked = true;
				this.spare.page++;

				let self = this;

				//ПОЛУЧАЕМ ЗАКАЗЫ
				axios.get(URL, {
						params: {
							action: 'getBasketItems',
							page: self.spare.page,
						}
					})
					.then(function (res) {

						self.spare.blocked = false;

						if(res.data.list.length > 0) {
							self.spare.list = self.spare.list.concat(res.data.list);

							//отображение кнопки подгрузки
							if(+res.data.total > self.spare.list.length) {
								self.spare.more = true;
							}
							else {
								self.spare.more = false;
							}

						}
						else {
							self.spare.empty = true;
						}


					})
					.catch(function (error) {
						console.log(error);
					})
					.then(function () {
						// always executed
					});	

			}


		},

		//закрытие окна выбора запчастей
		spareClose() {
			this.spare.filter = '';
			this.showFormSpare = false;
		},

		//сброс списка выбранных запчастей
		spareReset() {

			this.spare.filter = '';

			//удаляем прикреплённые значения 
			this.add.spareParts = [];
			//снимаем отметки
			this.spare.list.forEach(function(order){
				order.BASKET.forEach(function(item){
					item.CHECKED = false;
				});
			});
		},

		//выбор запчасти из списка
		setSpare(e, spare) {

			let id = e.target.value,
				checked = e.target.checked;

			spare.CHECKED = checked;

			if(checked) {
				this.add.spareParts.push(id);
			}
			else {
				let index = this.add.spareParts.indexOf(id);
				this.add.spareParts.splice(index, 1);
			}

		},

		//удаление запчасти из списка
		deleteAddSpareItem(id) {

			let index = this.add.spareParts.indexOf(id);
			this.add.spareParts.splice(index, 1);


			this.spare.list.forEach(function(order){

				order.BASKET.forEach(function(item){

					if(item.ID == id) {
						item.CHECKED = false;
					}

				});

			});


		},

		//фильтрация окна списка запчастей
		setSpareFilter() {


			let input = this.spare.filter.toLowerCase(),
				orderList = this.$refs.spareOrder;

			orderList.forEach(function(order){

				let orderText = order.innerText.toLowerCase(),
					items = order.querySelectorAll('label');

			if(input.length > 0) {

				if(orderText.indexOf(input) >= 0 ) {

					order.style.display = 'block';

					items.forEach(function(label){

						let labelText = label.innerText.toLowerCase();

						if(labelText.indexOf(input) >= 0) {
							label.classList.add('marked');
						}
						else {
							label.classList.remove('marked');
						}
					})

				}
				else {

					order.style.display = 'none';
					items.forEach(function(label){
						label.classList.remove('marked');
					})

				}				
			}
			else {

				order.style.display = 'block';
				items.forEach(function(label){
					label.classList.remove('marked');
				})

			}


			});

		},

    },

}
</script>

<style>

    @import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,400;0,700;1,400&display=swap');

    #app {
        font-family: 'OpenSans', Arial, Helvetica, sans-serif;
        font-size: 15px;
        color: #474747;
        max-width: 1100px;
        margin: 100px auto;
    }

    @import "assets/style.css";
    @import "../node_modules/vue2-datepicker/index.css";
    @import "../node_modules/vue-select/dist/vue-select.css";

</style>
