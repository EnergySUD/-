<template>
	<div id="app">
		<router-view/>
	</div>
</template>

<script>
	
	export default {
		created() {
			document.getElementById('loading').remove();
			
		},
		data() {
			return {

			}
		},
		methods: {
			
		}

	}
</script>

<style lang="scss">
	#app {
		font-family: 'Avenir', Helvetica, Arial, sans-serif;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		color: #2c3e50;
		max-width: 640px;
		margin: 0 auto;
		position: relative;
	}
	
	* {
		margin: 0;
		padding: 0;
		font: inherit;
		font-size: 100%;
	}
	
	html,
	body {
		width: 100%;
		font-size: 14px;
		a {
			text-decoration: none;
		}
	}
</style>