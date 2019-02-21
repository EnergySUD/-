<template>
	<div class="order">
		<swiper loop auto :aspect-ratio="1/1" :show-desc-mask="false" dots-position="center" :list="goods.imgList"></swiper>
		<div class="goods-header">
			<div class="goods-title">
				<div class="goods-title-main">
					<span>{{ goods.product_name }}</span>
				</div>
				<div class="goods-title-sub">{{ goods.txt }}</div>
			</div>
			<div class="goods-price">
				<div class="goods-price-current">
					<span>¥&nbsp;</span>
					<i class="goods-price-text">
						{{ price }}
					</i>
				</div>
			</div>
			<div class="goods-freight">
				<div class="goods-freight-postage">
					运费: <span>免运费(新疆、西藏除外)</span>
				</div>
			</div>
		</div>
		<div class="goods-ensure">
			<div class="clearfix">
				<img src="http://tencent365.work/icon-zhengpin.png" alt="">
				<img src="http://tencent365.work/icon-shang.png" alt="">
				<img src="http://tencent365.work/icon-danbao.png" alt="">
				<img src="http://tencent365.work/icon-7tian.png" alt="">
				<img src="http://tencent365.work/icon-shouhou.png" alt="">
			</div>
		</div>
		
		<div class="goods-bar-group">
			<group title="选择商品规格">
				<cell :title="selectedSku? '已选: '+selectedSku:'选择:'" @click.native="select = true" is-link></cell>
				<cell-box>配送方式：快递</cell-box>
			</group>
		</div>
		
		<div class="order-user-info">
			<group title="收货人信息">
				<x-input title="收货人:" required :min="2" v-model="userInfo.full_name"></x-input>
				<x-input title="电话号码:" required type="tel" :min="11" :max="11" v-model="userInfo.telephone"></x-input>
				<x-address title="收货地址:" v-model="userInfo.address" raw-value :list="addressData"></x-address>
				<x-input title="详细地址:" v-model="userInfo.details"></x-input>
				<x-textarea title="下单备注:" v-model="userInfo.txt" placeholder="请填写备注信息" :show-counter="false" :rows="3"></x-textarea>
			</group>
		</div>
		
		<div class="tips" @click="showTips = true">
			售后问题请点击添加客服微信号：<span>188********</span>
		</div>
		
		<div class="goods-payment">
			<flexbox>
				<flexbox-item>
					<x-button type="default" @click.native="buy">货到付款</x-button>
				</flexbox-item>
				<flexbox-item>
					<x-button type="primary" @click.native="wxbuy">微信支付</x-button>
				</flexbox-item>
			</flexbox>
		</div>
		
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
		
		<!-- 弹窗客服二维码 -->
		<popup v-model="showTips">
			<div class="desc-receive">
				<img src="http://tencent365.work/wx.jpg">
			</div>
		</popup>
		
		<!-- 弹窗选择商品规格 -->
		<popup v-model="select">
			<div class="goods-sku-container">
				<div class="goods-sku-header clearfix">
					<div class="img">
						<img src="http://tencent365.work/goods.jpg">
					</div>
					<div class="info">
						<div class="name">{{ goods.product_name }}</div>
						<div class="goods-price">￥{{ price }}</div>
						<div class="close"><icon type="cancel" @click.native="select = false"></icon></div>
					</div>
				</div>
				<div class="goods-sku-body">
					<div class="container">
						<div v-for="(item,index) in spu.attrs" :key="index" class="goods-sku-row">
							<div class="title">{{ item.key }}:</div>
							<span :class="{'item':true,'active':activeSku[item.key][item1.name]}" @click="getSelectSku(item.key,item1.name)" v-for="(item1,i) in item.values" :key="i">{{ item1.name }}</span>
						</div>
					</div>
				</div>
				<div class="goods-sku-stock">
					<div class="container">
						<cell title="购买数量:">
							<inline-x-number :min="1" button-style="round"  @on-change="changeCount" v-model="count"></inline-x-number>
						</cell>
					</div>
				</div>
			</div>
		</popup>
		
		<!-- 错误提示 -->
		<toast v-model="toastMsg.flag" type="text">{{toastMsg.text}}</toast>
	</div>
</template>

<script>
	import { Value2nameFilter as value2name, Popup, Group, Swiper, Cell, CellBox, Icon, XButton, Flexbox, FlexboxItem, InlineXNumber,Toast,XInput,XAddress,ChinaAddressV4Data,XTextarea } from 'vux'
	const imgSrc = [
		'http://tencent365.work/goods.jpg', 
		'http://tencent365.work/goods1.jpg',
		'http://tencent365.work/goods2.jpg', 
		'http://tencent365.work/goods3.jpg'
	];
	const imgList = imgSrc.map((one, index) => ({
		url: 'javascript:',
		img: one
	}))

	export default {
		name: 'order',
		components: {
			Swiper,Popup,Group,Cell,CellBox,Icon,XButton,Flexbox,FlexboxItem,InlineXNumber,Toast,XInput,XAddress,XTextarea
		},
		data() {
			return {
				addressData:ChinaAddressV4Data,
				select:false,
				showTips:false,
				selectedSku:'',
				price:"",
				count:1,
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
				}],
				goods:{
					product_name:"智能除螨抑菌美肤变色毛巾212121212121212121212121212121212121苏德苏德所多21212121",
					txt:'商品简单说明',
					imgList: imgList
				},
				toastMsg:{
					flag:false,
					text:''
				},
				sku:[{
						product_price:114.00,
						market_price:114.00,
						sku_group:'双重加压舒适男款;M;NT-16C-0308;'
					},
					{
						product_price:115.00,
						market_price:115.00,
						sku_group:'双重加压舒适男款;L;NT-16C-0308;'
					},
					{
						product_price:116.00,
						market_price:116.00,
						sku_group:'双重加压舒适女款;M;NT-16C-0308;'
					},
					{
						product_price:117.00,
						market_price:117.00,
						sku_group:'双重加压舒适女款;L;NT-16C-0308;'
					}
				],
				spu:{
					attrs:[{
								key:'款式',
								values:[{
										name:'双重加压舒适男款'
									},{
										name:'双重加压舒适女款'
									}]
							},{
								key:'尺码',
								values:[{
									name:'M'
									},{
									name:'L'
									}]
							},{
								key:'规格',
								values:[{
									name:'NT-16C-0308'
								}]
						}]
				},
				activeSku:{},
				userInfo:{
					full_name:'',
					telephone:'',
					address:[],
					details:'',
					txt:''
				}
				
			}
		},
		created() {
			var that = this
			document.title = "智能除螨抑菌美肤变色毛巾"
			that.init()
		},
		methods: {
			/*
				*页面初始化
			*/
			init(){
				//遍历选择sku
				let that = this,attrs = this.$data.spu.attrs,activeSku={};
				for(let i = 0; i < attrs.length; i++){
					activeSku[attrs[i].key] = {};
					for(let j = 0; j < attrs[i].values.length;j++){
						activeSku[attrs[i].key][attrs[i].values[j].name] = false;
					}
				}
				that.$data.activeSku = activeSku;
				//获取价格区间
				that.getPrice()
			},
			/*
				*显示提示
				* text：提示内容
				* resetCount：count是否复位（归一）
			*/
			showToast(text,resetCount){
				this.$data.toastMsg.text = text;
				this.$data.toastMsg.flag = true;
				setTimeout(()=>{
					this.$data.toastMsg.flag = false;
					if(resetCount){this.$data.count = 1;}
				},1500)
			},
			/*
				*选择购买数量
				* val：点击增加或者减少后的数值
			*/
			changeCount(val){
				let checkSelectSku = this.checkSelectSku();
				//判断规格是否都已选
				if(checkSelectSku){
					this.$data.count = val;
					this.$data.selectedSku = checkSelectSku + val + '个';
				}else{
					this.showToast('请选择规格',true);
				}
			},
			/*
				*获取价格区间
			*/
			getPrice(){
				let that = this,sku = this.$data.sku;
				let min_p_price = sku[0].product_price,max_p_price = sku[0].product_price;
				
				for(let i = 0;i < sku.length;i++){
					min_p_price = Math.min(min_p_price,sku[i].product_price);
					max_p_price = Math.max(max_p_price,sku[i].product_price);
				}
				if (Number.isInteger(min_p_price)){ min_p_price = parseFloat(min_p_price).toFixed(2)}
				if (Number.isInteger(max_p_price)){ max_p_price = parseFloat(max_p_price).toFixed(2)}
				
				if(min_p_price == max_p_price){that.$data.price = min_p_price;}
				else if(min_p_price > max_p_price){that.$data.price = max_p_price + ' ~ ' + min_p_price;}
				else{that.$data.price = min_p_price + ' ~ ' + max_p_price;}
			},
			/*
				*检查哪些规格已经选择
			*/
			checkSelectSku(){
				let activeSku = this.$data.activeSku,selectedSku='';
				for(let j in activeSku){
					for(let k in activeSku[j]){
						if(activeSku[j][k]){
							selectedSku += k + ';';
						}
					}
				}
				//判断规格是否都已选
				if(selectedSku.split(';').length > this.$data.spu.attrs.length){
					return selectedSku
				}else{
					return ''
				}
				
			},
			/*
				*选择规格
				* key：sku的key的值
				* item：sku的values中的一个值
			*/
			getSelectSku(key,item){
				let activeSku = this.$data.activeSku,selectedSku='';
				for(let i in activeSku[key]){
					activeSku[key][i] = false;
				}
				activeSku[key][item] = true;
				
				selectedSku = this.checkSelectSku();
				if(selectedSku){
					this.$data.selectedSku = selectedSku + '1个';
					for(let j = 0; j < this.$data.sku.length;j++){
						if(this.$data.sku[j].sku_group == selectedSku){
							this.$data.price = parseFloat(this.$data.sku[j].product_price).toFixed(2);
						}
					}
				}
			},
			/* 
				*检查用户信息的完整性
			*/ 
			checkInfo(){
				let userInfo = this.$data.userInfo;
				let full_name = this.$data.userInfo.full_name.replace(/\s+/g,"");
				if(!this.$data.selectedSku){
					this.showToast('请选择规格！');return false
				}
				if(full_name.length < 2){
					this.showToast('请填写正确的收货人姓名！');return false
				}
				if(!(/^1(3|4|5|7|8|9)\d{9}$/.test(userInfo.telephone))){
					this.showToast('请填写正确的电话号码！');return false
				}
				if(userInfo.address.length < 1){
					this.showToast('请填写收货地址！');return false
				}
				//去空格
				for(let v in userInfo){
					if(v != 'address'){
						userInfo[v] = userInfo[v].replace(/\s+/g,"");
					}
				}
				return true
			},
			/* 
				*货到付款
			*/
			buy(){
				if(this.checkInfo()){
					
					console.log(value2name(this.$data.userInfo.address,ChinaAddressV4Data));
					console.log(this.$data.userInfo,this.checkSelectSku());
				}
			},
			/* 
				*微信支付
			*/
			wxbuy(){
				if(this.checkInfo()){
					console.log(value2name(this.$data.userInfo.address,ChinaAddressV4Data));
					console.log(this.$data.userInfo,this.checkSelectSku());
				}
			}
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
	.order {
		max-width: 550px;
		margin: auto 0;
		background-color: #f8f8f8;
		.goods-header{
			background-color: #fff;
			padding: 10px;
			.goods-title{
				.goods-title-main{
					display: inline;
					font-size: 16px;
					line-height: 22px;
					word-break: break-all;
					word-wrap: break-word;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
					span{
						vertical-align: middle;
					}
				}
				.goods-title-sub{
					margin-top: 6px;
					font-size: 13px;
					color: #999;
					line-height: 18px;
					word-break: break-all;
					word-wrap: break-word;
					overflow: hidden;
					text-overflow: ellipsis;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					-webkit-box-orient: vertical;
				}
			}
			.goods-price{
				padding: 10px 0;
				.goods-price-current{
					display: inline-block;
					margin-right: 5px;
					vertical-align: middle;
					font-size: 14px;
					color: #f44;
					.goods-price-text{
						display: inline-block;
						vertical-align: middle;
						font-size: 18px;
					}
				}
			}
			.goods-freight{
				.goods-freight-postage{
					line-height: 12px;
					background-color: #fff;
					font-size: 12px;
					color: #999;
				}
			}
		}
		.goods-ensure{
			padding: 10px 0;
			background-color: #fff;
			img{
				width: 20%;
				float: left;
			}
		}
		.goods-bar-group{
			color: #323233;
			font-size: 14px;
		}
		.goods-sku-container{
			background-color: #fff;
			.goods-sku-header{
				padding: 10px 15px;
				border-bottom: #ebedf0 solid 1px;
				.img{
					float: left;
					width: 80px;
					height: 80px;
					border-radius: 2px;
					img{
						max-width: 100%;
						max-height: 100%;
					}
				}
				.info{
					margin-left: 100px; 
					position: relative;
					div{
						display: inline-block;
					}
					.name{
						margin-bottom: 10px; 
						word-break: break-all;
						word-wrap: break-word;
						overflow: hidden;
						text-overflow: ellipsis;
						display: -webkit-box;
						-webkit-line-clamp: 2;
						-webkit-box-orient: vertical;
					}
					.goods-price{
						color: #f44;
					}
					.close{
						position: absolute;
						right: 0;
					}
				}
			}
			.goods-sku-body{
				max-height: 280px;
				overflow-y: scroll;
				.container{
					margin-left: 15px;
					padding: 12px 0 2px;
					.goods-sku-row{
						margin: 0 15px 10px 0;
						span{
							cursor: pointer;
						}
						.title{
							padding-bottom: 10px;
							font-size: 14px;
						}
						.active{
							color: #fff !important;  
							border-color: #f44 !important;
							background: #f44;
						}
						.item{
							display: inline-block;
							padding: 5px 9px;
							margin: 0 10px 10px 0;
							height: 28px;
							min-width: 52px;
							line-height: 16px;
							font-size: 12px;
							color: #323233;
							text-align: center;
							border: 1px solid #969799;
							border-radius: 3px;
							-moz-box-sizing: border-box;
							box-sizing: border-box;
						}
					}
				}
			}
			.goods-sku-stock{
				padding-bottom:20px; 
				.container{
					border-top: 0.0625rem #ebedf0 solid;
					border-bottom: 0.0625rem #ebedf0 solid;
				}
			}
		}
		.tips{
			background-color: #fff;
			padding: 10px;
			span{
				color: #f44;
			}
		}
		.desc-receive{
			img{
				width: 100%;
			}
		}
		.goods-payment{
			background-color: #fff;
			padding: 10px;
			margin-top: 20px;
			border-top: 0.0625rem #ebedf0 solid;
			border-bottom: 0.0625rem #ebedf0 solid;
		}
		.goods-more{
			margin-top: 50px;
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
