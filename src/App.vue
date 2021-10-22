<template>
    <div id="app">

        <div v-cloak>

            <div v-if="!carLog.error" class="td-carlog" ref="carLogTop">

                <h3>Журнал обслуживания</h3>
                <span v-if="!showFormAdd" class="td-carlog__btn add" @click="switchFormAdd(true)">Добавить запись</span>

                <Form v-if="showFormAdd" :entry="false"/>

                <!-- список записей -->
                <div class="td-carlog__list" ref="carLogListTop" :class="{'blocked':carLogListLoad}">

                    <paginate
                        v-if="carLog.listPgn.pages > 1"
                        v-model="carLog.listPgn.page"
                        :page-count="carLog.listPgn.pages"
                        :click-handler="setPage"
                        :prev-text="'Пред.'"
                        :next-text="'След.'"
                        :container-class="'td-carlog__pagen'">
                    </paginate>

                    <transition-group name="entry" :duration="500" tag="div">
                    <div v-for="item in carLogList" :key="item.id" class="td-carlog__list-item">

                        <div class="list-item__control">
                            <!-- Удалить запись -->
                            <div class="list-item__delete-block">
                                <span class="btn" @click="switchPreDel({id:item.id, val:true})" title="Удалить">Удалить</span>
                                <div class="list-item__delete-popup" :class="{'show': item.preDel}">
                                    <span class="close" @click="switchPreDel({id:item.id, val:false})">Закрыть</span>
                                    <p>Вы уверены?<br>Запись будет удалена <b>безвозвратно</b>!</p>
                                    <span class="td-carlog__btn" @click="deleteItemCarLog(item.id)">Удалить</span>
                                </div>						
                            </div>
                            <span class="td-carlog__btn edit" @click="switchFormEdit({id:item.id, val:true})" title="Изменить">Изменить</span>                       
                        </div>

                        <div class="name" :class="'ico-'+item.type.id"> <b>{{item.id}}</b> {{item.type.name}}</div>
                        <span class="date">{{item.date}}</span>
                        <span class="price">{{Number(item.price).toLocaleString('ru')}}</span>
                        <span class="mileage">{{Number(item.mileage).toLocaleString('ru')}}</span>
                        <span class="descr">{{item.descr}}</span>

                        <ul v-if="item.basket">
                            <li v-for="prod in item.basket" :key="prod.ID">{{prod.NAME}}</li>
                        </ul>

                        <Form v-if="item.edit" :entry="item"/>

                    </div>
                    </transition-group>

                    <!-- В журнале нет записей -->
                    <p v-if="carLogList.length == 0" class="td-carlog__descr note">В журнале пока нет ни одной записи</p>

                    <paginate
                        v-if="carLog.listPgn.pages > 1"
                        v-model="carLog.listPgn.page"
                        :page-count="carLog.listPgn.pages"
                        :click-handler="setPage"
                        :prev-text="'Пред.'"
                        :next-text="'След.'"
                        :container-class="'td-carlog__pagen'">
                    </paginate>

                </div>

            </div>
            
            <p v-else class="td-carlog__descr note">{{carLog.error}}</p>

        </div>

    </div>

</template>

<script>

import {mapGetters, mapActions, mapMutations} from 'vuex'
import Form from './components/form.vue'


export default {
    name: 'App',
    components: {
        Form: Form
    },

    created() {

        //ПАРСИНГ GET ПАРАМЕТРОВ
        let uri = window.location.href.split('?');
        if (uri.length == 2) {
            let vars = uri[1].split('&');
            let getVars = {};
            let tmp = '';

            vars.forEach(function(v){
                tmp = v.split('=');

                if(tmp.length == 2) getVars[tmp[0]] = tmp[1];
            });

            this.updateGetUrl(getVars);
 
        }

    },

    computed: {

        //store значения
        ...mapGetters([
            'carLog',
            'carLogList',
            'carLogListLoad',
            'showFormAdd',
        ]),

    },

    mounted() {
        //выводим список записей
        this.fetchCarLog();
    },

    methods: {

        //store методы
        ...mapActions([
            'fetchCarLog',
            'pagenCarLog',
            'deleteItemCarLog',
        ]),
        ...mapMutations([
            'updateGetUrl',
            'switchFormAdd',
            'switchFormEdit',
            'switchPreDel',
        ]),

        //пагинация
        setPage(page){

            this.pagenCarLog(page);
            //скрол вверх
            this.$refs.carLogTop.scrollIntoView({behavior: 'smooth'});

        },

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
