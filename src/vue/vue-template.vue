/** Test File for VueJS Template
 *
 * @see https://github.com/xiaojue/vue-wx/blob/master/test/template/tag.vue
 */

<template>
<div>

    <!-- 注释节点测试 -->
    <!--
        <p class="pcls" id='myp'>{{message}}</p>
    -->

    <!-- 普通节点测试 -->
    <p v-text="message"></p>
    <p v-bind:id="myid"></p>
    <aside v-bind:class="isActive"> aside </aside>
    <p :id="shortId"></p>
    <p v-on:click="clickFunc1"></p>
    <p @click="clickFunc2"></p>
    <h1 :class="h1"> h1 </h1>
    <header v-show="ok"> header </header>
		<h2 :style="mystyle"> h2 </h2>
    <footer v-if="ok1"> footer </footer>
    <footer v-else-if="ok2"> footer </footer>
    <footer v-else> footer </footer>

    <!-- 模板节点测试 -->
    <template v-if="ok">
        <h1 v-if="ok2">ok</h1>
    </template>
	<template v-else> nook</template>

</div>
</template>
