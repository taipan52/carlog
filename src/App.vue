<template>
    <div id="app">

        <div class="td-carlog">

            <h3>Журнал обслуживания</h3>
            <span class="td-carlog__btn add" @click="addForm = !addForm">Добавить запись</span>

            <Form v-if="addForm"/>

            <!-- список записей -->
            <div class="td-carlog__list" ref="carLogListTop">

                <transition-group name="entry" :duration="500" tag="div">
                <div v-for="item in carLog.list" :key="item.id" class="td-carlog__list-item">
                    <div class="name" :class="'ico-'+item.type.id">{{item.type.name}}</div>
                    <span class="date">{{item.date}}</span>
                    <span class="price">{{item.price}}</span>
                    <span class="mileage">{{item.mileage}}</span>
                    <span class="descr">{{item.descr}}</span>
                    <span class="td-carlog__btn">Удалить</span>
                    <span class="td-carlog__btn">Изменить</span>

                    <ul v-if="item.basket">
                        <li v-for="prod in item.basket" :key="prod.ID">{{prod.NAME}}</li>
                    </ul>

                </div>
                </transition-group>

                <paginate
                    v-model="carLog.listPgn.page"
                    :page-count="carLog.listPgn.pages"
                    :click-handler="carLogPagen"
                    :prev-text="'Пред.'"
                    :next-text="'След.'"
                    :container-class="'td-carlog__pagen'">
                </paginate>

            </div>

        </div>

    </div>

</template>

<script>

import {mapGetters, mapActions} from 'vuex'
import Form from './components/form.vue'


export default {
    name: 'App',
    components: {
        Form: Form
    },

    data(){
        return {
            page: 1,
            addForm: false,
        }
    },

    created() {

        //получаем номер страницы
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        let pageValue = urlParams.get('page'),
            page = pageValue ? Number( pageValue.replace(/\D/g, '') ) : 1;

        this.page = page;
    },

    computed: {

        //store значения
        ...mapGetters([
            'carLog',
        ]),
    },

    mounted() {

        this.fetchCarLog({
            limit: this.carLog.listPgn.limit,
            page: this.page
        });

    },

    methods: {

        //store методы
        ...mapActions([
            'fetchCarLog',
        ]),

        //пагинация
        carLogPagen(page){

            const queryString = window.location.search;
            const urlParams = new URLSearchParams(queryString);

            if(page == 1) {
                urlParams.delete('page');
            }
            else {
                urlParams.set('page', page);
            }

            history.pushState(null, null, "?"+urlParams.toString());

            this.fetchCarLog({
                limit: this.carLogElemLimit,
                page: page
            });

            //скрол вверх
            this.$refs.carLogListTop.scrollIntoView({behavior: 'smooth'});

        }
    }


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
