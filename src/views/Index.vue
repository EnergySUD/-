<template>
	<div class="index">
		<div class="article">
			<div class="article-title"><span>{{ goods.wa_title }}</span></div>
			<div class="article-content" v-html="goods.details"></div>
		</div>
		
		<div class="goods-header" id="jumpGoods">
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
		
		<!-- 跳转下单 -->
		<div class="jump-order">
			<div class="container" @click="jumpOrder">
				<div class="text">去下单</div>
			</div>
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
 	// 商品文案
	let details = '<p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">新春假期已经过去了，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">很多小伙伴都已经“回城”了。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">经历过了春运大浪潮，<br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">小编的最深的&nbsp;<span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); background-color: rgb(245, 185, 48); word-wrap: break-word !important;">两个感受</span>，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">人太多了，手机太不抗用了。</span></strong></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx3.sinaimg.cn/mw690/007bvLPkgy1g075q1vfexg30dw0767ml.gif" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">人多就不用说了，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">每年一到春运都是&nbsp;<strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">一票难求&nbsp;</strong>的状况。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">而咱们今天就谈一下这手机的问题，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">手机的电量根本支撑不住啊！</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">坐飞机还好，几个小时就到了，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">坐火车或者自驾的小伙伴真是很头疼，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); background-color: rgb(245, 185, 48); word-wrap: break-word !important;">怎么打发在车上的无聊时间？</span><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); word-wrap: break-word !important;">&nbsp;</span></strong><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); word-wrap: break-word !important;">&nbsp;</span></strong><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; font-size: 20px; word-wrap: break-word !important;">玩手机</span></strong></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx1.sinaimg.cn/mw690/007bvLPkgy1g075q27q97j30b0078dga.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">可是玩一会儿电量就往下掉，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">85%，60%，35%，20%······</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">真害怕突然就关机了，坚持不到下车。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx3.sinaimg.cn/mw690/007bvLPkgy1g075q2lwyuj30k80b3dgb.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">我们都知道手机是我们生活中不可缺少的存在，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">听音乐，看电影，打游戏，刷微博，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">功能越来越多，性能越来越好，</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">可是耗电量越来越大，</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">可是电池只有3000-5000mAh。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">平时我们都手机都是一天好几充，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">更别说在枯燥的火车上了。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx2.sinaimg.cn/mw690/007bvLPkgy1g075q34oy7g30ec07h1hz.gif" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">相信很多小伙伴也都有过手机没电的尴尬。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">在一个小调查中表示，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">手机没电会让现代人缺乏安全感。</span></strong></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">特别是现在日常中很多都依靠手机，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">就像手机支付，手机地图，<br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); background-color: rgb(245, 185, 48); word-wrap: break-word !important;">想象一下陌生的地方，身无分文，</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); background-color: rgb(245, 185, 48); word-wrap: break-word !important;">还有比这更惨的么？</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx2.sinaimg.cn/mw690/007bvLPkgy1g075q3pt1wj30h00hkaas.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">亦或者，</strong></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">和客户打电话约见面，手机没电了！</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">和朋友吃饭买单，手机没电了！</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">和对象打电话，手机没电了！</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">········</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx1.sinaimg.cn/mw690/007bvLPkgy1g075q419ffj30ik0b4mxd.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">因此随时能保障手机有电很重要。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">比如你需要一个充电宝，</span></strong></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">像现在很多地方都有&nbsp;<span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); background-color: rgb(245, 185, 48); word-wrap: break-word !important;">共享充电宝</span>，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">虽然很方便，却是也要押金，费用，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">而且在店面里面，你也不好意思不消费。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx1.sinaimg.cn/mw690/007bvLPkgy1g075q4eet5j30go0b4q3j.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">那倒不如自己带上一个，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">嫌麻烦，嫌重，嫌难看？</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">今天小编就给大家推荐一款</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">小巧身型，高颜值，高性能的大容量充电宝</strong></span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; font-size: 24px; word-wrap: break-word !important;">旅鲨 D-80 全屏有线充电宝（16000mAh）</span></strong></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx3.sinaimg.cn/mw690/007bvLPkgy1g075q4p9fej30m00czjrr.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">87*87*30mm的尺寸大小，304g的重量，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">小巧而方便可以随身携带。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">一个手就可以掌握，</span></strong></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">大小差不多是手机的一半，<br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">比起传统充电宝可强多了。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx3.sinaimg.cn/mw690/007bvLPkgy1g075q57k01j30m00fc74r.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">16000mAh的电池容量能满足生活需求，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">不同于一些充电宝的虚标显示，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">它采用的&nbsp;<span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">聚合物电芯15倍续航</span>，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">电量更大更持久，而且更安全！</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx4.sinaimg.cn/mw690/007bvLPkgy1g075q5mco6j30j40fawf5.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">能给<span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); background-color: rgb(245, 185, 48); word-wrap: break-word !important;">Phone XS Max冲5-6次电，</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); background-color: rgb(245, 185, 48); word-wrap: break-word !important;">华为P10冲5-6次电，</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">再也不用为手机没电而苦恼了。<br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx3.sinaimg.cn/mw690/007bvLPkgy1g075q5yl9oj30m00h375i.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">很多人不愿意出门带充电宝，<br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">原因是长得丑，手机拖个尾巴也不好看。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">而这款D-80的颜值设计也非常高，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">UV亮面玻璃般的质感</span>，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">就像手机屏幕一样，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">给视觉带来更加的体验。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx3.sinaimg.cn/mw690/007bvLPkgy1g075q6bqtcj30m00o4gmo.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">它的<strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">开机方式</strong>也非常独特，<br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">只需要随意摇一摇，</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">有没有一种帅炫酷的感觉。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx1.sinaimg.cn/mw690/007bvLPkgy1g075q6x8a0j30m00sdmyb.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">而且它采用的是&nbsp;<span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">电量数字显示屏技术</span>，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">可以更加直观的看到还有多少剩余电量。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx1.sinaimg.cn/mw690/007bvLPkgy1g075q7aitvj30m00kxgm9.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">配有&nbsp;<span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">两个USB输出口</span>，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">可以同时给两台手机充电，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">当然也能为你的IPad充电。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); background-color: rgb(245, 185, 48); word-wrap: break-word !important;">再也不怕两个人为争一个充电宝了。</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx4.sinaimg.cn/mw690/007bvLPkgy1g075q7t0mtj30m00r676m.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">当它没电的时候，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">可以利用配送的安卓数据线充电，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">一般要充8-10个小时，</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">选择晚上睡觉的时候充电，一点也不耽误！</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx4.sinaimg.cn/mw690/007bvLPkgy1g075q87wiqj30m00j5js1.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">相信很多人都有摔手机的经历，</strong><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">当手机和地面接触的那刻，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(201, 56, 28); word-wrap: break-word !important;">不仅屏幕碎了，心也跟着碎了···</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">充电宝也不例外，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">难免会发生磕磕碰碰，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">而这款充电宝采用的&nbsp;<span style="margin: 0px; padding: 0px; max-width: 100%; background-color: rgb(245, 185, 48); word-wrap: break-word !important;">铝制外壳</span>，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">对保护它起到很大的作用。</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx2.sinaimg.cn/mw690/007bvLPkgy1g075q8ym43g30hs09zkjl.gif" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">是不是很多小伙伴都被它吸引了？</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;">目前推出的的款式是&nbsp;<strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">神秘黑&nbsp;</strong>和&nbsp;<span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(222, 108, 146); word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">玫瑰金</strong></span>，</p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">神秘黑</strong>，<span style="margin: 0px; padding: 0px; max-width: 100%; text-decoration-line: underline; word-wrap: break-word !important;">炫酷又神秘，隐藏着庞大的能量。</span><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(222, 108, 146); word-wrap: break-word !important;">玫瑰金</span></strong>，<span style="margin: 0px; padding: 0px; max-width: 100%; text-decoration-line: underline; word-wrap: break-word !important;">时尚又清新，像窗边的玫瑰安静优雅。</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; widows: 1; text-align: center; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx1.sinaimg.cn/mw690/007bvLPkgy1g075q9ai4hj30kg0cgt8y.jpg" style="width: 100%;"><br></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><img class="js_catchingremoteimage" src="http://wx2.sinaimg.cn/mw690/007bvLPkgy1g075q9kmgij30lw0fz3z7.jpg" style="width: 100%;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><br style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; widows: 1; text-align: center; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(255, 250, 250); word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; background-color: rgb(245, 185, 48); word-wrap: break-word !important;">小身材，大容量，高颜值的充电宝</span></span></p><section class="" powered-by="xiumi.us" style="margin: 0px; padding: 0px; max-width: 100%; color: rgb(51, 51, 51); font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; font-size: 17px; letter-spacing: 0.544px; line-height: 27.2px; text-align: justify; widows: 1; word-wrap: break-word !important;"><section class="" style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><section class="" style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><section data-role="outer" label="Powered by 135editor.com" style="margin: 0px; padding: 0px; max-width: 100%; font-family: 微软雅黑; word-wrap: break-word !important;"><section data-role="paragraph" class="" style="margin: 0px; padding: 0px; max-width: 100%; border: 0px none; word-wrap: break-word !important;"><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; text-indent: 0em; font-family: -apple-system-font, BlinkMacSystemFont, Arial, sans-serif; text-align: center; letter-spacing: 1px; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; border: 0px; vertical-align: baseline; font-weight: 700; font-size: 24px; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; vertical-align: baseline; word-wrap: break-word !important;"></span><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; font-family: ;Helvetica Neue;, Helvetica, sans-serif; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">旅鲨 D-80&nbsp;</span></strong></span></strong></span><strong style="margin: 0px; padding: 0px; max-width: 100%; font-size: 24px; text-indent: 0em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; font-family: ;Helvetica Neue;, Helvetica, sans-serif; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">全屏有线充电宝</strong></span></strong></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; text-indent: 0em; font-family: -apple-system-font, BlinkMacSystemFont, Arial, sans-serif; text-align: center; letter-spacing: 1px; line-height: 2em; word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; font-size: 20px; word-wrap: break-word !important;">（16000mAh）</span></strong></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; text-indent: 0em; font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; border: 0px; vertical-align: baseline; text-align: center; letter-spacing: 1px; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; border: 0px; vertical-align: baseline; font-weight: 700; font-size: 20px; word-wrap: break-word !important;">小编推荐价</span></p><p style="margin-bottom: 0px; padding: 0px; max-width: 100%; clear: both; min-height: 1em; text-indent: 0em; font-family: -apple-system-font, BlinkMacSystemFont, ;Helvetica Neue;, ;PingFang SC;, ;Hiragino Sans GB;, ;Microsoft YaHei UI;, ;Microsoft YaHei;, Arial, sans-serif; border: 0px; vertical-align: baseline; text-align: center; letter-spacing: 1px; line-height: 2em; word-wrap: break-word !important;"><span style="margin: 0px; padding: 0px; max-width: 100%; font-size: 20px; color: rgb(201, 56, 28); word-wrap: break-word !important;"><strong style="margin: 0px; padding: 0px; max-width: 100%; word-wrap: break-word !important;">188.00元/个</strong></span></p></section></section></section></section></section>';

	export default {
		name: 'index',
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
					wa_title:'出门在外就怕手机没电，它的大小只是手机的一半，却能让手机满血复活',
					details:details,
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
				*跳转下单
			*/
			jumpOrder(){
				document.querySelector("#jumpGoods").scrollIntoView(true);
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
	.index {
		max-width: 550px;
		margin: auto 0;
		background-color: #f8f8f8;
		.article{
			background-color: #fff;
			.article-title{
				text-align: center;
				margin: 1rem 1.2rem;
				position: relative;
				span{
					position: relative;
					background: red;
					color: #fff;
					font-size: 18px;
					line-height: 1.6;
					padding: 0.6rem 0.6rem;
					display: inline-block;
					box-shadow: 0rem 0.2rem 0.4rem #d7d7d7;
					&::after{
						content: '';
						width: 0.3rem;
						height: 84%;
						position: absolute;
						background: #696969;
						z-index: 1;
						top: 7.2%;
						right: -0.3rem;
					}
					&::before{
						content: '';
						width: 0.3rem;
						height: 84%;
						position: absolute;
						background: #696969;
						z-index: 1;
						top: 7.2%;
						left: -0.3rem;
					}
				}
				&::after{
					content: '';
					width: 10px;
					height: 10px;
					position: absolute;
					background: red;
					z-index: 1;
					bottom: -5px;
					left: 50%;
					transform: rotate(45deg);
				}
			}
			.article-content{
				padding: 10px;
			}
		}
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
		.jump-order{
			.container{
				position: fixed;
				bottom: 115px;
				right: 9px;
				width: 42px;
				height: 50px;
				background: url(http://tencent365.work/qiang.png) no-repeat 0 0 / contain;
				z-index: 99;
				cursor: pointer;
				.text{
					position: absolute;
					top: 36px;
					left: 0;
					right: 0;
					margin: 0 auto;
					text-align: center;
					font-family: PingFangSC-Medium;
					font-size: 10px;
					color: #fff;
				}
			}
		}
	}
</style>
