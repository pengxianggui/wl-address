import VueAddress from "./index.vue";

// 为组件提供 install 安装方法，供按需引入
VueAddress.install = function(Vue) {
  Vue.component(VueAddress.name, VueAddress);
};

// 默认导出组件
export default VueAddress;
