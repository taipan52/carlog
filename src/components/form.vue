<template>
    <div>
        Форма тут<br>
        <span @click="test">Тест</span>
    </div>
</template>

<script>
export default {
    name: 'Form',
    props: {
        msg: String
    },
    methods: {

        test() {

            console.log(this.$parent);

        },

    },

}
</script>

<style scoped>

</style>
