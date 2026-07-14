// 预置官方模板数据
// 用于 seedPresets action 一次性写入数据库
// items[] 字段说明：
//   content   - 待办内容（必填）
//   priority  - 优先级：normal | high | urgent（默认 normal）
//   tags      - 待办分类标签数组（用于行程内筛选，可选）
//   assignType- 指派类型：默认 'all'（全员）

const PRESET_TEMPLATES = [
  {
    key: 'thailand-trip',
    name: '泰国出行清单',
    description: '泰国 5-7 日游完整准备清单，涵盖证件、订票、装备与到达后事项，出国前逐项打钩不遗漏。',
    tags: ['出国', '海边'],
    items: [
      { content: '办理/检查护照（有效期 6 个月以上）', priority: 'urgent', tags: ['证件'] },
      { content: '在线申请泰国电子落地签 / 确认免签政策', priority: 'high', tags: ['证件'] },
      { content: '预订往返机票', priority: 'high', tags: ['交通'] },
      { content: '预订酒店 / 民宿', priority: 'high', tags: ['住宿'] },
      { content: '兑换泰铢现金', priority: 'high', tags: ['财务'] },
      { content: '办理境外流量卡或开通国际漫游', priority: 'normal', tags: ['通讯'] },
      { content: '购买境外旅行保险', priority: 'high', tags: ['财务'] },
      { content: '打印机票、酒店订单等纸质凭证', priority: 'normal', tags: ['证件'] },
      { content: '准备防晒霜、泳衣、拖鞋', priority: 'normal', tags: ['装备'] },
      { content: '常用药品（肠胃药、感冒药、创可贴）', priority: 'normal', tags: ['装备'] },
      { content: '万能转换插头', priority: 'normal', tags: ['装备'] },
      { content: '下载离线地图与翻译 App', priority: 'normal', tags: ['通讯'] },
      { content: '记录酒店地址（中英泰文）备用', priority: 'normal', tags: ['住宿'] }
    ]
  },
  {
    key: 'hiking-trip',
    name: '徒步登山清单',
    description: '一日至多日徒步登山装备与安全清单，从鞋服、补给到应急，安全出行第一位。',
    tags: ['登山', '露营'],
    items: [
      { content: '登山鞋 / 防滑徒步鞋', priority: 'high', tags: ['装备'] },
      { content: '速干衣裤 + 冲锋衣（防风防雨）', priority: 'high', tags: ['装备'] },
      { content: '登山杖', priority: 'normal', tags: ['装备'] },
      { content: '双肩背包（带腰封）', priority: 'normal', tags: ['装备'] },
      { content: '足量饮用水 / 水袋', priority: 'urgent', tags: ['补给'] },
      { content: '高能量食物（能量棒、坚果、巧克力）', priority: 'high', tags: ['补给'] },
      { content: '头灯 / 手电（含备用电池）', priority: 'high', tags: ['装备'] },
      { content: '急救包（绷带、消毒、止痛药）', priority: 'urgent', tags: ['安全'] },
      { content: '防晒霜、遮阳帽、太阳镜', priority: 'normal', tags: ['装备'] },
      { content: '规划路线并下载离线轨迹', priority: 'high', tags: ['安全'] },
      { content: '查看天气预报，确认无恶劣天气', priority: 'high', tags: ['安全'] },
      { content: '告知家人/朋友行程与预计返回时间', priority: 'urgent', tags: ['安全'] },
      { content: '充电宝 + 数据线', priority: 'normal', tags: ['装备'] }
    ]
  },
  {
    key: 'camping-trip',
    name: '露营清单',
    description: '户外露营装备清单，帐篷、炊具、照明、保暖一应俱全，享受自然又不狼狈。',
    tags: ['露营', '自驾'],
    items: [
      { content: '帐篷 + 地钉 + 防潮垫', priority: 'urgent', tags: ['装备'] },
      { content: '睡袋 / 充气床垫', priority: 'high', tags: ['装备'] },
      { content: '天幕 / 遮阳棚', priority: 'normal', tags: ['装备'] },
      { content: '折叠桌椅', priority: 'normal', tags: ['装备'] },
      { content: '便携炉具 + 燃气罐', priority: 'high', tags: ['炊事'] },
      { content: '炊具、餐具、水杯', priority: 'high', tags: ['炊事'] },
      { content: '食材、饮用水、调料', priority: 'high', tags: ['补给'] },
      { content: '营地灯 / 氛围灯 + 备用电池', priority: 'normal', tags: ['装备'] },
      { content: '保暖衣物（夜间降温）', priority: 'high', tags: ['装备'] },
      { content: '垃圾袋（无痕露营）', priority: 'normal', tags: ['其他'] },
      { content: '驱蚊液 / 花露水', priority: 'normal', tags: ['装备'] },
      { content: '充电宝 / 车载电源', priority: 'normal', tags: ['装备'] },
      { content: '急救包', priority: 'high', tags: ['安全'] }
    ]
  },
  {
    key: 'seaside-trip',
    name: '海边度假清单',
    description: '海岛/海边度假必备清单，玩水、拍照、防晒样样周到。',
    tags: ['海边', '亲子'],
    items: [
      { content: '泳衣 / 沙滩装', priority: 'high', tags: ['装备'] },
      { content: '防晒霜（高倍数）+ 晒后修复', priority: 'high', tags: ['装备'] },
      { content: '遮阳帽、太阳镜', priority: 'normal', tags: ['装备'] },
      { content: '沙滩拖鞋 / 涉水鞋', priority: 'normal', tags: ['装备'] },
      { content: '浮潜三宝（面镜、呼吸管、脚蹼）', priority: 'normal', tags: ['装备'] },
      { content: '防水手机袋 / 防水相机', priority: 'normal', tags: ['装备'] },
      { content: '大浴巾 / 速干毛巾', priority: 'normal', tags: ['装备'] },
      { content: '换洗衣物 + 防水收纳袋', priority: 'normal', tags: ['装备'] },
      { content: '沙滩玩具（亲子）', priority: 'normal', tags: ['亲子'] },
      { content: '常备药品（晕船药、防中暑）', priority: 'high', tags: ['安全'] },
      { content: '预订海景酒店 / 出海项目', priority: 'high', tags: ['住宿'] }
    ]
  },
  {
    key: 'ski-trip',
    name: '滑雪出行清单',
    description: '滑雪场出行装备与保暖清单，从雪具到护具，畅滑不怕冷。',
    tags: ['滑雪'],
    items: [
      { content: '滑雪服（防水防风）', priority: 'high', tags: ['装备'] },
      { content: '滑雪镜 / 护目镜', priority: 'high', tags: ['装备'] },
      { content: '头盔', priority: 'urgent', tags: ['安全'] },
      { content: '保暖内衣（速干）', priority: 'high', tags: ['装备'] },
      { content: '滑雪手套、雪袜', priority: 'normal', tags: ['装备'] },
      { content: '面罩 / 围脖', priority: 'normal', tags: ['装备'] },
      { content: '护具（护臀、护膝、护腕）', priority: 'high', tags: ['安全'] },
      { content: '预订雪场门票 / 雪具租赁', priority: 'high', tags: ['预订'] },
      { content: '防晒霜（雪地反光强）', priority: 'normal', tags: ['装备'] },
      { content: '润唇膏、保湿护肤', priority: 'normal', tags: ['装备'] },
      { content: '暖宝宝', priority: 'normal', tags: ['装备'] },
      { content: '预订住宿 / 交通', priority: 'high', tags: ['预订'] }
    ]
  },
  {
    key: 'city-trip',
    name: '城市周末游清单',
    description: '轻装城市短途游，适合周末 City Walk 与探店打卡，简单高效。',
    tags: ['城市', '亲子'],
    items: [
      { content: '预订高铁/机票', priority: 'high', tags: ['交通'] },
      { content: '预订酒店（近地铁站）', priority: 'high', tags: ['住宿'] },
      { content: '规划打卡地点与探店清单', priority: 'normal', tags: ['行程'] },
      { content: '购买热门景点/展馆门票', priority: 'normal', tags: ['预订'] },
      { content: '充电宝 + 数据线', priority: 'normal', tags: ['装备'] },
      { content: '舒适步行鞋', priority: 'normal', tags: ['装备'] },
      { content: '雨伞 / 防晒', priority: 'normal', tags: ['装备'] },
      { content: '证件、少量现金、交通卡', priority: 'high', tags: ['证件'] },
      { content: '常用洗漱用品', priority: 'normal', tags: ['装备'] }
    ]
  },
  {
    key: 'roadtrip-trip',
    name: '自驾出行清单',
    description: '长途自驾出行前的车辆检查与随车物品清单，安全上路无忧。',
    tags: ['自驾'],
    items: [
      { content: '检查驾照、行驶证、保险单', priority: 'urgent', tags: ['证件'] },
      { content: '车辆保养检查（机油、刹车、胎压）', priority: 'urgent', tags: ['车辆'] },
      { content: '备胎与换胎工具', priority: 'high', tags: ['车辆'] },
      { content: '规划路线并下载离线导航', priority: 'high', tags: ['行程'] },
      { content: '车载充电器 / 充电宝', priority: 'normal', tags: ['装备'] },
      { content: '饮用水与零食', priority: 'normal', tags: ['补给'] },
      { content: '纸巾、湿巾、垃圾袋', priority: 'normal', tags: ['装备'] },
      { content: '防晕车药、常用药品', priority: 'high', tags: ['安全'] },
      { content: 'ETC 是否可用 / 备足过路费', priority: 'normal', tags: ['财务'] },
      { content: '应急工具（搭电线、三角警示牌）', priority: 'high', tags: ['安全'] },
      { content: '提前预订沿途住宿', priority: 'high', tags: ['住宿'] }
    ]
  }
]

module.exports = { PRESET_TEMPLATES }
