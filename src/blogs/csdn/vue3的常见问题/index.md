---
title: Vue3的常见问题
published: 2026-04-25
description: ""
tags: []
category: CSDN迁移
draft: false
---

#### **对比Vue2和Vue3的差异**

1.  响应式原理

*   Vue2：基于object.defineProperty 实现，需递遍历对象，无法监听新增/删除属性，数组需通过push/splice等变异方法触发更新
*   Vue3： 基于proxy实现，直接代理整个对象/数组，原生支持监听新增/删除属性，Map/Set等数据结构，性能更优。

1.  API风格

*   Vue2：选项式API（OptionAPI）,逻辑data,methous, coputed 等选项拆分，代码复用依赖

```
export default{
    data(){return {count:0}},
    methods:{increment() {this.count++}},
    computed:{double(){return this,count*2}}
}
```

*   Vue3:组合式API（Composition API）,通过setup函数（或者
    
    ```
    <script setup>
    import {ref, computed}from 'Vue'
    const count = ref(0)
    const double = computed(()=>count.value*2)
    const increment = () => count.value++
    </script>
    ```
    
    *   Vue2：组件必须由单一根元素，无内置传送门，异步组件状态管理。
    *   Vue3：支持多根结点（Fragment），内置：:将组件内部渲染到指定DOM节点（如弹窗）；
    *   :处理异步组件加载状态（显示loading/错误）。
    
    1.  生命周期钩子
    
    Vue 2
    
    Vue3
    
    说明
    
    beforeCreate
    
    setup ( )
    
    合并到setup，无需显式调用
    
    created
    
    setup（）
    
    同上
    
    beforeMount
    
    onBeforeMount
    
    挂载前
    
    mounted
    
    onMounted
    
    挂在后
    
    beforeDestroy
    
    onBeforeUnmount
    
    卸载前
    
    destroyed
    
    onUnmounted
    
    卸载后
    
    1.  性能与体积
    
    *   Vue3：编译是优化（静态提升 PatchFlags 标记动态节点），虚拟Dom重写，包体积更小（Tree shaking 支持更好，比Vue2小约40%）。
    
    1.  TypeScript 支持
    
    *   Vue2：TS支持有限，需依赖vue-class-component，等库
    *   Vue3：原生用Ts编写，类型推断更友好，
        
        *   Vue2：默认VueCLI+webpack， 状态管理Pinia（Vuex官方继任者），配套Vue Router4.
        *   Vue3：推荐 Vite（更快的开发体验），状态管理用 Pinia（Vuex 官方继任者），配套 Vue Router 4。
        
        #### **Vue3和Vue2中v-model有一些变化，具体变了什么**
        
        1.  核心变化：默认绑定的Prop和事件名变更
        
        Vue2中，v-model对自定义组件默认绑定的是value Prop + input事件；
        
        Vue3中，为了避免和原生表单元素的value属性冲突（比如单选框，复选框的value有特殊含义），v-model 默认绑定的是modelValue Prop+update：modelValue事件。
        
        1.  对比示例：自定义组件的v-model
        
        Vue2写法
        
        ```
        <!-- 父组件 -->
        <template>
          <CustomInput v-model="msg" />
        </template>
        
        <!-- 子组件 CustomInput.vue -->
        <template>
          <input :value="value" @input="handleInput" />
        </template>
        
        <script>
        export default {
          props: ['value'], // 接收父组件的 value
          methods: {
            handleInput(e) {
              this.$emit('input', e.target.value) // 触发 input 事件更新父组件值
            }
          }
        }
        </script>
        ```
        
        Vue3写法（组合式API/选项式API都适合）
        
        ```
        <!-- 父组件 -->
        <template>
          <CustomInput v-model="msg" />
        </template>
        
        <!-- 子组件 CustomInput.vue -->
        <template>
          <input :value="modelValue" @input="handleInput" />
        </template>
        
        <script setup>
        // 选项式 API 写法同理，只是 props/emits 定义位置不同
        const props = defineProps(['modelValue']) // 接收 modelValue
        const emit = defineEmits(['update:modelValue']) // 声明要触发的事件
        
        const handleInput = (e) => {
          emit('update:modelValue', e.target.value) // 触发 update:modelValue 事件
        }
        </script>
        ```
        
        Vue3的设计思想
        
        对比Vue2和Vue3的设计差异
        
        更容易维护：1.Vue3 组合式API，2，更好的Typescript支持
        
        更快的速度：1.重写diffsuanfa，2.模版编译优化，3.更高的组件初始化
        
        更小的体积：1.良好的TreeShanking，2.按需引入
        
        更有的数据响应式 proxy
        
        vue2为选项式API Vue3为组合式API
        
        利用Vue2和Vue3，分别实现点击按钮+1
        
        ```
        <template>
          <div>
            <!-- 显示数字 -->
            <p>当前数字：{{ count }}</p>
            <!-- 绑定点击事件，触发加一方法 -->
            <button @click="increment">点击加一</button>
          </div>
        </template>
        
        <script>
        export default {
          // 定义响应式数据
          data() {
            return {
              count: 0 // 初始值为0
            };
          },
          // 定义方法
          methods: {
            increment() {
              this.count += 1; // 直接修改data中的数据，Vue2自动响应
            }
          }
        };
        </script>
        
        <style scoped>
        button {
          padding: 8px 16px;
          cursor: pointer;
        }
        </style>
        ```
        
        ```
        <template>
          <div>
            <!-- 显示数字，用法和Vue2一致 -->
            <p>当前数字：{{ count }}</p>
            <!-- 绑定点击事件 -->
            <button @click="increment">点击加一</button>
          </div>
        </template>
        
        <script setup>
        // 导入ref创建响应式数据
        import { ref } from 'vue';
        
        // 创建响应式数字（初始值0）
        const count = ref(0);
        
        // 定义加一方法（普通函数即可）
        const increment = () => {
          // ref创建的响应式数据，需通过.value修改值
          count.value += 1;
        };
        </script>
        
        <style scoped>
        button {
          padding: 8px 16px;
          cursor: pointer;
        }
        </style>
        ```
        
        性能，可维护性，扩展性
        
        Vue3核心变化
        
        vue2和Vue3中的v-model 核心功能都是实现表单控件的双向数据绑定，但Vue3对v-model做了彻底的重构：解决了Vue2中与 .sync修饰符混用的双向绑定语法，同时支持自定义绑定属性和事件名 ；灵活性大幅提高。
        
        一，原生表单控件的v-model 基础用法
        
        这一层差异很小，主要是底层实现细节，日常使用感知不明显
        
        Vue2 中的底层逻辑，基于value属性和input事件，特殊控件（单选框？复选框 用checked+change）
        
        v-model= ：value @input