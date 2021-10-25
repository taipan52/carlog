<template>

    <div>

        <div class="td-carlog__spare-select">
            <span class="spare-select__item" v-for="item in spareSelectList" :key="item.ID">
                {{item.PROPS.brand_title}} <b>{{item.PROPS.original_article}}</b> {{item.NAME}} - <b>{{item.PRICE}}</b>руб.
                <i class="spare-select__item-delete" title="Удалить" @click="deleteAddSpareItem(item.ID)"></i>
            </span>
        </div>

        <span v-if="!showFormSpare" class="td-carlog__btn spare-add" @click="getBasketItems()">
            {{spareAddText}} запчасти / услуги
            <i class="info">Запчасти возможно прикреплять из вашей истории заказов и гаража</i>
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
        
    </div>    

</template>

<script>

export default ({
    name: 'Options',
    props: {
        list: []
    },

    data() {
        return {

            spare: {
                filter: '',
                list: [],
                blocked: false,
                more: false,
                empty: false,
                page: 0,
            },
            showFormSpare: false,

        }
    },

    created() {

        console.log(this.list);

    },

    computed: {

        spareAddText() {
            return this.list.length > 0 ? 'Изменить' : 'Прикрепить';
        },

        spareCloseText() {
            return this.list.length > 0 ? 'Сохранить' : 'Закрыть';
        },

        //Список выбранных запчастей
        spareSelectList() {
        let list = [];

        if(this.list.length > 0 ) {
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

    methods: {
        spareClose() {},
    },
})
</script>
