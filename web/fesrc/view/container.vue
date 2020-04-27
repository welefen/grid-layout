<template>
<div style="display:flex;flex-direction:column;height:100vh" @click="changeStatus">
  <div style="padding:20px;background:#fff;">
    <el-button type="primary" @click="addgridItem">Add Node</el-button>
    <el-button type="danger" :disabled="canDisabled" @click="deletegridItem">Delete Node</el-button>
    <el-button v-if="showBtn" type="success" @click="addTestCase">Add TestCase</el-button>


    <el-dropdown v-if="showBtn" @command="openFailItem" style="margin-left:10px;">
      <el-badge :value="failNums" class="item">
        <el-button type="primary">
          TestCases（{{successNums}}）<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
      </el-badge>
      <el-dropdown-menu slot="dropdown">
        <el-dropdown-item :command="index" v-for="(item, index) in failList" v-bind:key="index">{{item.name}}</el-dropdown-item>
      </el-dropdown-menu>
    </el-dropdown>
  </div>
  <div style="flex-grow: 1;display:flex;align-items: center;justify-content: space-evenly">
    <div class="grid-container" :style="gridWrapStyle">
        <div class="shadow grid-render-container grid-render-grid" :style="gridContainerStyle" :class="gridContainerActive" @click="editgridContainer($event)">
          <div class="shadow grid-item" :class="itemActiveClass(index)" @click="editgridItem(index, $event)" v-for="(item, index) in gridItems" :style="getgridItemStyle(index)" v-bind:key="index + 1">
            {{index + 1}}
          </div>
        </div>
      </div>
      <div class="grid-container" :style="gridWrapStyle">
        <div class="shadow grid-render-container grid-render-absolute">
          <div class="shadow absolute-item"  v-for="(item, index) in absoluteItems" :style="getAbsoluteItemStyle(index)" v-bind:key="index + 1">
            {{index + 1}}
          </div>
        </div>
      </div>
  </div>
</div>
</template>
<script>
import event from './event.js';
import Vue from 'vue';
import {getRender, addTestCase, getAllTest} from '../js/api.js';

const backgroundColors = [
  '#fff',
  '#4cb4e7',
  '#ffc09f',
  '#ffee93',
  '#e2dbbe',
  '#a3a380',
  '#DB9019',
  '#5ED5D1',
  '#1A2D27',
  '#FF6E97',
  '#F1AAA6',
  '#F6D6FF',
  '#B85A9A',
  '#9DD3FA',
  '#DFB5B7',
  '#4cb4e7',
  '#ffc09f',
  '#ffee93',
  '#e2dbbe',
  '#a3a380',
  '#DB9019',
  '#5ED5D1',
  '#1A2D27',
  '#FF6E97',
  '#F1AAA6',
  '#F6D6FF',
  '#B85A9A',
  '#9DD3FA',
  '#DFB5B7',
  '#4cb4e7',
  '#ffc09f',
  '#ffee93',
  '#e2dbbe',
  '#a3a380',
  '#DB9019',
  '#5ED5D1',
  '#1A2D27',
  '#FF6E97',
  '#F1AAA6',
  '#F6D6FF',
  '#B85A9A',
  '#9DD3FA',
  '#DFB5B7',
  '#4cb4e7',
  '#ffc09f',
  '#ffee93',
  '#e2dbbe',
  '#a3a380',
  '#DB9019',
  '#5ED5D1',
  '#1A2D27',
  '#FF6E97',
  '#F1AAA6',
  '#F6D6FF',
  '#B85A9A',
  '#9DD3FA',
  '#DFB5B7',
  '#4cb4e7',
  '#ffc09f',
  '#ffee93',
  '#e2dbbe',
  '#a3a380',
  '#DB9019',
  '#5ED5D1',
  '#1A2D27',
  '#FF6E97',
  '#F1AAA6',
  '#F6D6FF',
  '#B85A9A',
  '#9DD3FA',
  '#DFB5B7',
]
export default {
  data() {
    return {
      showBtn: location.hostname === '127.0.0.1',
      successNums: 0,
      failNums: 0,
      failList: [],
      gridWrapStyle: {},
      gridContainerProperties: {},
      gridContainerActive: '',
      gridContainerStyle: {},
      activeIndex: -1,
      gridItems: [],
      absoluteItems: [],
      absoluteContainerProperties: {},
      timer: 0
    }
  },
  mounted() {
    event.$on('changegridContainerProperties', this.changegridContainerProperties);
    event.$on('changegridItemProperties', this.changegridItemProperties);
    event.$emit('getgridStyle', 'container');
    [...new Array(3)].forEach((item, index) => {
      this.activeIndex = index;
      event.$emit('getgridStyle', 'item');
    });
    this.activeIndex = -1;
    if(this.showBtn) {
      getAllTest().then(data => {
        this.successNums = data.success;
        this.failNums = data.fail.length;
        this.failList = data.fail;
      })
    }
  },
  computed: {
    canDisabled() {
      if(this.gridContainerActive) return true;
      if(this.activeIndex === -1) return true;
      return false;
    }
  },
  beforeDestroy() {
    event.$off('changegridContainerProperties', this.changegridContainerProperties);
    event.$off('changegridItemProperties', this.changegridItemProperties);
  },
  methods: {
    openFailItem(index) {
      const item = this.failList[index];
      this.gridItems = item.items;
      this.activeIndex = -1;
      this.gridContainerActive = '';
      this.changegridContainerProperties(item.container);
      event.$emit('showgridAside', '', {});
    },
    addTestCase() {
      addTestCase(this.gridContainerProperties, this.gridItems).then(() => {
        this.$notify({
          title: '成功',
          message: '添加成功',
          type: 'success'
        });
      }).catch(err => {
        this.$notify.error({
          title: '错误',
          message: '添加失败'
        });
        console.error(err);
      })
    },
    getRender() {
      if(this.timer) {
        clearTimeout(this.timer);
        this.timer = 0;
      }
      this.timer = setTimeout(() => {
        Promise.resolve(getRender(this.gridContainerProperties, this.gridItems, this.showBtn)).then(data => {
          this.absoluteContainerProperties = {
            top: data.top,
            left: data.left,
            width: data.width,
            height: data.height
          }
          this.absoluteItems = data.children;
        }).catch((e) => {
          this.$notify.error({
            title: '错误',
            message: e.errmsg
          });
        })
      }, 50)
    },
    changeStatus() {
      return;
      this.activeIndex = -1;
      this.gridContainerActive = '';
      event.$emit('showgridAside', '', {})
    },
    addgridItem() {
      this.gridContainerActive = '';
      this.activeIndex = this.gridItems.length;
      event.$emit('getgridStyle', 'item');
      event.$emit('showgridAside', 'item', Object.assign({}, this.gridItems[this.activeIndex]))
      this.getRender();
    },
    deletegridItem() {
      if(this.activeIndex === -1) return;
      Vue.delete(this.gridItems, this.activeIndex);
      this.activeIndex = -1;
      this.getRender();
    },
    parseStyle(props, index) {
      const ret = {};
      const p = [
        'width', 'min-width', 'max-width', 'height', 'min-height', 'max-height',
        'padding-top', 'padding-right', 'padding-bottom', 'padding-left',
        'margin-top', 'margin-right', 'margin-bottom', 'margin-left',
        'border-top', 'border-right', 'border-bottom', 'border-left',
        'top', 'left', 'grid-row-gap', 'grid-column-gap'
      ];

      Object.keys(props).forEach((item) => {
        if(!props[item]) return;
        let newItem = item.replace(/[A-Z]/g, a => {
          return '-' + a.toLowerCase()
        });
        if(p.includes(newItem)) {
          if(newItem.startsWith('border-')) {
            newItem += '-width';
          }
          ret[newItem] = /^[\d\.\-]+$/.test(props[item]) ? props[item] + 'px' : props[item];
        } else {
          ret[newItem] = props[item];
        }
      })
      ret['background-color'] = backgroundColors[index];

      return ret;
    },
    itemActiveClass(index) {
      if(index === this.activeIndex) return 'grid-active'
    },
    editgridItem(index, evt) {
      evt.stopPropagation();
      this.activeIndex = index;
      this.gridContainerActive = '';
      const item = this.gridItems[index];
      event.$emit('showgridAside', 'item', Object.assign({}, item))
    },
    getAbsoluteItemStyle(index) {
      const item = this.absoluteItems[index];
      const properties = this.parseStyle(item, index + 1);
      return properties;
    },
    getgridItemStyle(index) {
      const item = this.gridItems[index];
      const properties = this.parseStyle(item, index + 1);
      return properties;
    },
    changegridItemProperties(properties) {
      if(this.activeIndex === -1) return;
      Vue.set(this.gridItems, this.activeIndex, properties);
      this.getRender();
    },
    changegridContainerProperties(properties) {
      this.gridContainerProperties = Object.assign({}, properties);
      this.gridWrapStyle = {
        width: properties.width + 'px',
        minWidth: properties.width + 'px',
        height: properties.height + 'px',
        minHeight: properties.height + 'px',
      };
      this.gridContainerStyle = this.parseStyle(properties, 0);
      this.getRender();
    },
    editgridContainer(evt) {
      evt.stopPropagation();
      if(this.gridContainerActive === 'grid-active') return;
      this.gridContainerActive = 'grid-active';
      this.activeIndex = -1;
      event.$emit('showgridAside', 'container', Object.assign({}, this.gridContainerProperties))
    }
  }
}
</script>
