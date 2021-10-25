<template>
    <!-- Форма добавления/редактирования записи -->
    
    <div class="td-carlog__form">

        <b class="td-carlog__form-title">{{formTextTitle}}</b>

        <div class="td-carlog__form-wrap">

            <div class="td-carlog__form-left">
                
                <div class="td-carlog__form-type">

                    <date-picker 
                        :lang="datePickerLang"
                        v-model="form.date" 
                        :editable="false"
                        :clearable="false"
                        title-format="DD MMMM YYYY"
                        format="DD.MM.YYYY">
                            
                        <template #icon-calendar><span>d</span></template>

                    </date-picker>

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

                </div>

                <div class="td-carlog__form-group">
                    <div class="td-carlog__form-number"> 
                        <money 
                            v-model="form.mileage"
                            class="inpt" 
                            v-bind="money"></money>
                        <label :class="{'focus': (form.mileage.length > 1 || form.mileage > 0)}">Пробег</label>
                        <span class="unit">км.</span>
                    </div>
                    <div class="td-carlog__form-number">
                        <money 
                            v-model="form.price"
                            class="inpt" 
                            v-bind="money"></money>
                        <label :class="{'focus': (form.price.length > 1 || form.price > 0) }">Стоимость</label>
                        <span class="unit">руб.</span>
                    </div>
                </div> 

            </div>

            <div class="td-carlog__form-right">
                <div class="td-carlog__form-descr">
                    <textarea v-model="form.descr"></textarea>
                    <label :class="{'focus': form.descr.length > 0}">Описание</label>
                </div>				
            </div>				
        </div>

        <!-- Запчасти / Услуги -->
        <Options list=""/>

        <p v-if="formError" class="td-carlog__descr error">{{formError}}</p>

        <!-- Редактирование -->
        <div v-if="entry" class="td-carlog__form-footer">
            <span class="td-carlog__btn" @click="formEdit">Изменить</span>
            <span class="td-carlog__btn cancel" @click="formEditCancel">Отмена</span>				
        </div>

        <!-- Добавление -->
        <div v-else class="td-carlog__form-footer">
            <span class="td-carlog__btn" @click="formSubmit">Добавить</span>
            <span class="td-carlog__btn cancel" @click="formCancel">Отмена</span>				
        </div>

    </div>
    
</template>

<script>

import {mapGetters, mapActions, mapMutations} from 'vuex'
import Options from './options.vue'

export default {
    name: 'Form',
    props: {
        entry: {},
    },
    components: {
        Options: Options
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
            money: {
                decimal: ',',
                thousands: ' ',
                prefix: '',
                suffix: '',
                precision: 0,
                masked: false
            },
            form:{
                type: {},
                date: new Date(),
                price: '',
                mileage: '',
                spareParts: [],
                descr: '',
            },
            formError: false,

        }
    },

    created() {

        if(this.entry) {

            const entry = this.entry;
            let arrDate =  entry.date.split('.');

            this.form.type = entry.type;
            this.form.date = new Date(arrDate[2], arrDate[1]-1, arrDate[0]);
            this.form.price = entry.price;
            this.form.mileage = entry.mileage;
            this.form.descr = entry.descr;
        }
        else {
            this.form.type = this.carLog.type[0];
        }

        

    },
    computed: {

        //store значения
        ...mapGetters([
            'carLog'
        ]),

        formTextTitle() {
            return this.entry ? 'Редактирование записи' : 'Добавление записи';
        },

    },
    methods: {

        //store методы
        ...mapActions([
            'createItemCarLog',
            'editItemCarLog',
        ]),

        ...mapMutations([
            'switchFormAdd'
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

        async formSubmit() {

			this.formError = false;

            //объект нового элемента
			const newItem = {
                id: 0,
                type: this.form.type,
                date: this.form.date.toLocaleDateString('ru-RU'),
                price: this.form.price,
                mileage: this.form.mileage,
                descr: this.form.descr,
                //
                edit: false,
                more: false,
                mark: false,
                preDel: false,
            };

            const ans = await this.createItemCarLog(newItem);

            if(ans.success) {
                //скрываем форму
                this.clearForm();
            }
            else {
                //отображаем ошибку
                this.formError = ans.html;

            }

        },
        formCancel() {
            this.switchFormAdd(false);
            this.clearForm();
        },

        formEdit() {

            //объект даты в строку
            function formatDate(d) {
                var month = '' + (d.getMonth() + 1),
                    day = '' + d.getDate(),
                    year = d.getFullYear();

                if (month.length < 2) 
                    month = '0' + month;
                if (day.length < 2) 
                    day = '0' + day;

                return [day, month, year].join('.');
            }

            let form = this.form;

            this.entry.type = form.type;
            this.entry.date = formatDate(form.date);
            this.entry.price = form.price;
            this.entry.mileage = form.mileage;
            this.entry.descr = form.descr;

console.log(this.entry);

            this.editItemCarLog(this.entry);

            this.entry.edit = false;


        },

        formEditCancel() {
            this.entry.edit = false;
        }

    },

}
</script>