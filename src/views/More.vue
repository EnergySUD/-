<template>
	<div class="more">
		<!-- 商品推荐 -->
		<div class="goods-more">
			<div class="goods-more-title">-- 更多精选商品 --</div>
			<div class="goods-list clearfix">
				<ul>
					<li v-for="(item,i) in goodsMore" :key="i" class="wrapper">
						<a :href="item.link" class="item">
							<div class="photo">
								<img :src="item.product_img">
							</div>
							<div class="info">
								<div class="title">{{ item.product_name }}</div>
								<div class="sale-info">
									<span class="sale-price">
										￥{{ item.min_price }}
									</span>
								</div>
							</div>
						</a>
					</li>
				</ul>
			</div>
		</div>
		
	</div>
</template>

<script>
	export default {
		name: 'more',
		components: {
		},
		data() {
			return {
				goodsMore:[{
						link:'javascript:;',
						product_img:'http://tencent365.work/goods.jpg',
						product_name:"智能除螨抑菌美肤变色毛巾212121212121212121212121212121212121苏德苏德所多21212121",
						min_price:114.00,
					},{
						link:'javascript:;',
						product_img:'http://tencent365.work/goods1.jpg',
						product_name:"智能除螨抑菌美肤变色毛巾212121212121212121212121212121212121苏德苏德所多21212121",
						min_price:114.00,
					},{
						link:'javascript:;',
						product_img:'http://tencent365.work/goods2.jpg',
						product_name:"智能除螨抑菌美肤变色毛巾212121212121212121212121212121212121苏德苏德所多21212121",
						min_price:114.00,
					},{
						link:'javascript:;',
						product_img:'http://tencent365.work/goods3.jpg',
						product_name:"智能除螨抑菌美肤变色毛巾212121212121212121212121212121212121苏德苏德所多21212121",
						min_price:114.00,
				}]
			}
		},
		created() {
			
		},
		methods: {
			
		}
	}
</script>

<style lang='scss' scoped>
	/* 清除浮动 */
	.clearfix:after {
		content: "";
		height: 0;
		line-height: 0;
		display: block;
		visibility: hidden;
		clear: both;
	}
	.clearfix {
		zoom: 1;
	}
	.more {
		max-width: 550px;
		margin: auto 0;
		background-color: #f8f8f8;
		.goods-more{
			padding-top: 30px;
			.goods-more-title{
				padding: 5px 0 9px;
				font-size: 14px;
				color: #333;
				text-align: center;
			}
			.goods-list{
				padding: 0 4px 10px;
				.wrapper{
					float: left;
					width: 50%;
					.item{
						display: block;
						position: relative;
						min-height: 100px;
						color: #333;
						background-color: #fff;
						-moz-box-sizing: border-box;
						box-sizing: border-box;
						margin: 3px;
						.photo{
							text-align: center;
							overflow: hidden;
							position: relative;
							max-height: 500px;
							z-index: 0;
							padding-top: 100%;
							height: 0;
							img{
								position: absolute;
								top: 0;
								left: 0;
								right: 0;
								bottom: 0;
								margin: auto;
								width: 100%;
							}
						}
						.info{
							text-align: left;
							padding: 10px;
							.title{
								height: 36px;
								overflow: hidden;
								text-overflow: ellipsis;
								display: -webkit-box;
								-webkit-line-clamp: 2;
								-webkit-box-orient: vertical;
								font-size: 14px;
								line-height: 18px;
								word-break: break-all;
								margin-bottom: 6px;
							}
							.sale-info{
								line-height: 1;
								color: #f44;
								font-size: 16px;
							}
						}
					}
					
				}
			}
		}

	}
</style>
