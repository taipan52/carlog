<template>
    <!-- Форма добавления/редактирования записи -->
    <transition name="slide">
    <div class="td-carlog__form">

        <b class="td-carlog__form-title">Добавление записи</b>

        <div class="td-carlog__form-wrap">

            <div class="td-carlog__form-left">
                
                <div class="td-carlog__form-type">

                    <v-select 
                        :options="carLog.type" 
                        :getOptionLabel="type => type.id"
                        :searchable="false"
                        :clearable="false"
                        placeholder="Выберите тип"
                        :value="form.type"
                        v-model="form.type"
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
                        v-model="form.date" 
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
                            @input="changeNumber($event, 'price')"
                            type="tel" 
                            autocomplete="off" 
                            placeholder="Сумма">
                        <span class="unit">руб.</span>
                    </label>
                    <label>
                        <input 
                            class="inpt" 
                            @input="changeNumber($event, 'mileage')"
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
                    <textarea v-model="form.descr" placeholder="Описание"></textarea>
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
            <span class="td-carlog__btn" @click="formSubmit">Добавить</span>
            <span class="td-carlog__btn cancel" @click="formCancel">Отмена</span>				
        </div>

    </div>
    </transition>
</template>

<script>

import {mapGetters, mapActions} from 'vuex'

export default {
    name: 'Form',
    props: {
        msg: String
    },
    data() {
        return {
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

            //потом удалить
            form:{
                type: {},
                date: new Date(),
                price: '',
                mileage: '',
                spareParts: [],
                descr: '',
            },
            spare: {
                filter: '',
                list: [],
                blocked: false,
                more: false,
                empty: false,
                page: 0,
            },
            formError: false,
            showForm: false,
            showFormSpare: false,

        }
    },
    created() {
        this.form.type = this.carLog.type[0];
    },
    computed: {

        //store значения
        ...mapGetters([
            'carLog',
        ]),
    },
    methods: {

        //store методы
        ...mapActions([
            'createItemCarLog',
        ]),

        //очитска формы
        clearForm() {

            this.form = {
                type: {},
                date: new Date(),
                price: '',
                mileage: '',
                spareParts: [],
                descr: '',
            };  

        },

		//ввод значения стоимости/пробега
		changeNumber(e, item){

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

			this.form[item] = e.target.value = value;

		},

        changePrice() {},
        changeMileage() {},
        spareSelectList() {},
        spareClose() {},
        spareAddText() {},
        spareCloseText() {},

        async formSubmit() {

			this.formError = false;

            //объект нового элемента
			const newItem = {
                id: 0,
                type: this.form.type,
                date: this.form.date.toLocaleDateString('ru-RU'),
                price: this.form.price.replace (/\D/, ''),
                mileage: this.form.mileage.replace (/\D/, ''),
                descr: this.form.descr,
            };

            const ans = await this.createItemCarLog(newItem);

            if(ans.success) {
                //скрываем форму
                console.log(ans);
                this.clearForm();
            }
            else {
                //отображаем ошибку
                this.formError = ans.html;

            }

        },
        formCancel() {
            this.clearForm();
        },

    },

}
</script>