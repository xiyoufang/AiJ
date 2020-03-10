<template>
    <div id="app">
        <h1>Hello App!</h1>
        <h2>{{$store.getters.getTitle}}</h2>
        <p>
            <router-link to="/foo">Go to Foo</router-link>
        </p>
        <p>
            <router-link to="/bar">Go to Bar</router-link>
        </p>
        <router-view/>
    </div>
</template>
<script>
    export default {
        name: 'App',
        data: function () {
            console.log(this.$root.$data)
            return {publicState: this.$root.$data.publicState}
        }
    }
</script>
