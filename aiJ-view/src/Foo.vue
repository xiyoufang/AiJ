<template>
    <div>
        <p>{{ publicState.name }}</p>
        <p>{{ privateState.name }}</p></div>
</template>

<script>
    export default {
        name: 'Foo',
        data: function () {
            return {
                privateState: {
                    name: 'Foo'
                }, publicState: this.$root.$data.publicState
            }
        }
    }
</script>
