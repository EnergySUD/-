module.exports = {
	baseUrl: './',
	outputDir: 'dist',
	lintOnSave: false,  //出除警告
	configureWebpack: config => {
        require('vux-loader').merge(config, {
            options: {},
            plugins: [
		    	{name: 'vux-ui'},
		    	{name: 'less-theme', path: 'src/style/theme.less'}
		  	]
        })
   	}

}
