<template>
    <div>
        <p>{{ publicState.name }}</p>
        <p>{{ privateState.name }}</p>
        <label>
            <input v-model="publicState.name"></input>
        </label>
    </div>
</template>

<script>
    export default {
        name: 'Foo',
        data: function () {
            return {
                privateState: {
                    name: 'Bar'
                },
                publicState: this.$root.$data.publicState
            }
        }
    }
</script>
