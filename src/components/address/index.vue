<template>
    <div class="wl-address" v-if="selfType">
        <el-select
                @change="provinceChange"
                v-model="province_act"
                :filterable="filterable"
                :clearable="clearable"
                :disabled="disabled"
                :size="size"
                value-key="code"
                placeholder="请选择省份"
        >
            <el-option v-for="item in provinces" :key="item.code" :label="item.name" :value="item"></el-option>
        </el-select>
        <el-select
                @change="citysChange"
                v-model="city_act"
                :filterable="filterable"
                :clearable="clearable"
                :disabled="disabled"
                :size="size"
                value-key="code"
                placeholder="请选择城市"
                v-if="level >= 1"
        >
            <el-option v-for="item in citys" :key="item.code" :label="item.name" :value="item"></el-option>
        </el-select>
        <el-select
                @change="countysChange"
                v-model="county_act"
                :filterable="filterable"
                :clearable="clearable"
                :disabled="disabled"
                :size="size"
                value-key="code"
                placeholder="请选择区/县"
                v-if="level >= 2"
        >
            <el-option v-for="item in countys" :key="item.code" :label="item.name" :value="item"></el-option>
        </el-select>
    </div>
    <el-cascader
            popper-class="wl-address-cascader"
            v-model="cascader_val"
            v-else
            :size="size"
            :disabled="disabled"
            :options="provinces"
            :clearable="clearable"
            :separator="separator"
            :props="cascader_props"
            :filterable="filterable"
            :placeholder="placeholder"
            :show-all-levels="showAllLevels"
            @change="getCascaderVal"
            @active-item-change="handleItemChange"
    ></el-cascader>
</template>
<script>
    import {getProvince, getCity, getCounty} from "./address.js"; // 导入获取省市县

    export default {
        name: "vue-address",
        data() {
            return {
                provinces: [], // 省份
                citys: [], // 市
                countys: [], // 县
                province_act: {
                    code: "",
                    name: ""
                }, // 当前省
                city_act: {
                    code: "",
                    name: ""
                }, // 当前省
                county_act: {
                    code: "",
                    name: ""
                }, // 当前省
                cascader_props: {
                    label: "name",
                    value: "code",
                    children: "children"
                },
                cascader_val: [] // 级联选中值
            };
        },
        props: {
            // 输入框尺寸
            size: {
                type: String,
                default: () => ""
            },
            // 地址类型 default默认 cascader级联选择器
            type: {
                type: String,
                default: () => "default"
            },
            // 默认数据
            value: {
                type: String,
                default: () => ""
            },
            // 是否可搜索
            filterable: {
                type: Boolean,
                default: false
            },
            // 是否可清空选项
            clearable: {
                type: Boolean,
                default: () => false
            },
            placeholder: {
                type: String,
                default: () => "请选择地址"
            },
            // 是否禁用
            disabled: {
                type: Boolean,
                default: () => false
            },
            // cascader模式选项分隔符
            separator: String,
            // cascader模式选项分隔符
            showAllLevels: {
                type: Boolean,
                default: () => true
            },
            level: {
                type: Number,
                default: () => 2,
                validator: (value) => {
                    return [0, 1, 2].indexOf(value) > -1
                }
            }
        },
        created() {
            this.provinces = getProvince(this.level);
            this.analysisDefaultAddress();
        },
        methods: {
            // 级联选择动态获取下级
            handleItemChange(val) {
                const {level} = this
                let [p_code, c_code] = val;
                if (c_code) {
                    let act_city = this.citys.find(item => item.code === c_code);
                    if (act_city.children.length > 0) {
                        return;
                    }

                    if (level >= 2) {
                        this.countys = getCounty(act_city);
                        act_city.children = this.countys;
                    }
                } else {
                    let act_province = this.provinces.find(item => item.code === p_code);
                    if (act_province.children.length > 0) {
                        return;
                    }

                    if (level >= 1) {
                        this.citys = getCity(act_province, level, true);
                        act_province.children = this.citys;
                    }
                }

                this.getCascaderVal(val)
            },
            // 选择完毕数据组装
            getCascaderVal(val) {
                if (val.length === 0) {
                    this.$emit("input", "");
                    return
                }
                let [pro, cit, con] = val;
                this.province_act = this.provinces.find(item => item.code === pro);

                const address = [{
                    code: this.province_act.code, name: this.province_act.name
                }]

                if (cit) {
                    this.city_act = this.province_act.children.find(item => item.code === cit) // TODO
                    address.push({
                        code: this.city_act.code, name: this.city_act.name
                    })
                }

                if (con) {
                    this.county_act = this.city_act.children.find(item => item.code === con)
                    address.push({
                        code: this.county_act.code, name: this.county_act.name
                    })
                }
                //
                // if (con) {
                //     this.city_act = this.province_act.children.find(
                //         item => item.code === cit
                //     );
                //     this.county_act = this.city_act.children.find(
                //         item => item.code === con
                //     );
                // } else {
                //     this.city_act = this.province_act;
                //     this.county_act = this.city_act.children.find(
                //         item => item.code === cit
                //     );
                // }

                // let {code: pro_code, name: pro_name} = this.province_act;
                // let {code: cit_code, name: cit_name} = this.city_act;
                // let {code: cou_code, name: cou_name} = this.county_act;
                let string_address = JSON.stringify(address);
                this.$emit("input", string_address);
            },
            // 省份更改
            provinceChange(val) {
                this.city_act = {
                    code: "",
                    name: ""
                };
                this.county_act = {
                    code: "",
                    name: ""
                };
                this.countys = [];
                this.citys = getCity(val, this.level);

                const {province_act: {code, name}} = this
                this.$emit("input", JSON.stringify([{
                    code: code,
                    name: name
                }]));
            },
            // 城市更改
            citysChange(val) {
                this.county_act = {
                    code: "",
                    name: ""
                };
                this.countys = getCounty(val);

                const {province_act: {code: pro_code, name: pro_name}, city_act: {code: cit_code, name: cit_name}} = this
                this.$emit("input", JSON.stringify([
                    {code: pro_code, name: pro_name},
                    {code: cit_code, name: cit_name}
                ]));
            },
            // 县更改
            countysChange(val) {
                let {code: pro_code, name: pro_name} = this.province_act;
                let {code: cit_code, name: cit_name} = this.city_act;
                let {code: cou_code, name: cou_name} = this.county_act;
                // delete province_act['children']
                let string_address = JSON.stringify([
                    {code: pro_code, name: pro_name},
                    {code: cit_code, name: cit_name},
                    {code: cou_code, name: cou_name}
                ]);
                this.$emit("input", string_address);
            },
            // 解析默认地址
            analysisDefaultAddress() {
                if (!this.value) return;
                let address = "";
                try {
                    address = JSON.parse(this.value) || [];
                } catch (error) {
                    console.log("地址信息不合规范:" + error);
                }
                let data_format = address instanceof Array;
                if (!data_format) return;
                if (this.type === "default") {
                    [
                        this.province_act = {},
                        this.city_act = {},
                        this.county_act = {}
                    ] = address;

                    if (this.province_act.code) {
                        this.citys = getCity(this.province_act, this.level);
                    }

                    if (this.city_act.code) {
                        this.countys = getCounty(this.city_act);
                    }
                } else {
                    let [pro, cit, con] = address;
                    this.cascader_val =
                        pro.code !== cit.code
                            ? address.map(item => item.code)
                            : [pro.code, con.code];
                    this.cascaderData(this.cascader_val);
                }
            },
            // 处理默认地址时级联数据
            cascaderData(val) {
                let [p_code, c_code, n_code] = val;
                let act_province = this.provinces.find(item => item.code === p_code);
                this.citys = getCity(act_province, this.level, true);
                act_province.children = this.citys;
                if (n_code) {
                    let act_city = this.citys.find(item => item.code === c_code);
                    this.countys = getCounty(act_city);
                    act_city.children = this.countys;
                }
            },
            // 级联筛选函数
            /* filterMethod(node, key) {
              console.log(node);
              console.log(key);
            } */
        },
        watch: {
            address(val) {
                this.analysisDefaultAddress();
            }
        },
        computed: {
            selfType() {
                return this.type === "default";
            }
        }
    };
</script>

<style lang="css">
    .wl-address {
        display: flex;
        justify-content: space-between;
    }

    .wl-address .el-select {
        flex: 0.33;
    }

    .wl-address-cascader .el-scrollbar {
        max-height: 400px;
    }

    .wl-address-cascader .el-scrollbar > .el-scrollbar__wrap {
        overflow-x: hidden;
    }
</style>
