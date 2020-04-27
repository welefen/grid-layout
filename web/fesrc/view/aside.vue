<template>
  <div style="padding: 20px;padding-left:0">
    <el-form ref="form" :model="form" label-width="110px">
      <div v-if="type === 'container'">
        <!-- <el-form-item label="direction">
          <el-select v-model="gridContainer.direction" placeholder="direction" @change="changeProperty('direction', $event)">
            <el-option label="ltr" value="ltr">ltr</el-option>
            <el-option label="rtl" value="rtl">rtl</el-option>
          </el-select>
        </el-form-item> -->
         <el-form-item label="grid-auto-flow">
          <el-select v-model="gridContainer.gridAutoFlow" placeholder="gridAutoFlow" @change="changeProperty('gridAutoFlow', $event)">
            <el-option label="row" value="row">row</el-option>
            <el-option label="row dense" value="row dense">row dense</el-option>
            <el-option label="column" value="column">column</el-option>
            <el-option label="column dense" value="column dense">column dense</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="grid-template-rows">
          <el-input v-model="gridContainer.gridTemplateRows" type="text" @change="changeProperty('gridTemplateRows', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-template-columns">
          <el-input v-model="gridContainer.gridTemplateColumns" type="text" @change="changeProperty('gridTemplateColumns', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-template-areas">
          <el-input v-model="gridContainer.gridTemplateAreas" type="textarea" @change="changeProperty('gridTemplateAreas', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-auto-rows">
          <el-input v-model="gridContainer.gridAutoRows" type="text" @change="changeProperty('gridAutoRows', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-auto-columns">
          <el-input v-model="gridContainer.gridAutoColumns" type="text" @change="changeProperty('gridAutoColumns', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-row-gap">
          <el-input v-model="gridContainer.gridRowGap" type="text" @change="changeProperty('gridRowGap', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-column-gap">
          <el-input v-model="gridContainer.gridColumnGap" type="text" @change="changeProperty('gridColumnGap', $event)"></el-input>
        </el-form-item>

        <el-form-item v-if="type === 'container'" label="justify-content">
          <el-select v-model="gridContainer.justifyContent" placeholder="justifyContent" @change="changeProperty('justifyContent', $event)">
            <el-option label="stretch" value="stretch"></el-option>
            <el-option label="start" value="start"></el-option>
            <el-option label="end" value="end"></el-option>
            <el-option label="center" value="center"></el-option>
            <el-option label="space-between" value="space-between"></el-option>
            <el-option label="space-around" value="space-around"></el-option>
            <el-option label="space-evenly" value="space-evenly"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="type === 'container'" label="align-items">
          <el-select v-model="gridContainer.alignItems" placeholder="alignItems" @change="changeProperty('alignItems', $event)">
            <el-option label="stretch" value="stretch"></el-option>
            <el-option label="start" value="start"></el-option>
            <el-option label="center" value="center"></el-option>
            <el-option label="end" value="end"></el-option>
            <el-option disabled label="baseline" value="baseline"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="type === 'container'" label="align-content">
          <el-select v-model="gridContainer.alignContent" placeholder="alignContent" @change="changeProperty('alignContent', $event)">
            <el-option label="stretch" value="stretch"></el-option>
            <el-option label="start" value="start"></el-option>
            <el-option label="center" value="center"></el-option>
            <el-option label="end" value="end"></el-option>
            <el-option label="space-between" value="space-between"></el-option>
            <el-option label="space-around" value="space-around"></el-option>
            <el-option label="space-evenly" value="space-evenly"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="type === 'container'" label="justify-items">
          <el-select v-model="gridContainer.justifyItems" placeholder="justifyItems" @change="changeProperty('justifyItems', $event)">
            <el-option label="stretch" value="stretch"></el-option>
            <el-option label="start" value="start"></el-option>
            <el-option label="center" value="center"></el-option>
            <el-option label="end" value="end"></el-option>
          </el-select>
        </el-form-item>
        <!-- <el-form-item label="width">
          <el-input v-model="gridContainer.width" type="text" @change="changeProperty('width', $event)"></el-input>
        </el-form-item>
        <el-form-item label="height">
          <el-input v-model="gridContainer.height" type="text" @change="changeProperty('height', $event)"></el-input>
        </el-form-item> -->
      </div>
      <div v-if="type === 'item'">
        <el-form-item label="align-self">
          <el-select v-model="gridItem.alignSelf" placeholder="alignSelf" @change="changeProperty('alignSelf', $event)">
            <el-option label="auto" value="auto"></el-option>
            <el-option label="stretch" value="stretch"></el-option>
            <el-option label="start" value="start"></el-option>
            <el-option label="center" value="center"></el-option>
            <el-option label="end" value="end"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="justify-self">
          <el-select v-model="gridItem.justifySelf" placeholder="justifySelf" @change="changeProperty('justifySelf', $event)">
            <el-option label="auto" value="auto"></el-option>
            <el-option label="stretch" value="stretch"></el-option>
            <el-option label="start" value="start"></el-option>
            <el-option label="center" value="center"></el-option>
            <el-option label="end" value="end"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="grid-row-start">
          <el-input v-model="gridItem.gridRowStart" type="text" @change="changeProperty('gridRowStart', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-row-end">
          <el-input v-model="gridItem.gridRowEnd" type="text" @change="changeProperty('gridRowEnd', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-column-start">
          <el-input v-model="gridItem.gridColumnStart" type="text" @change="changeProperty('gridColumnStart', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-column-end">
          <el-input v-model="gridItem.gridColumnEnd" type="text" @change="changeProperty('gridColumnEnd', $event)"></el-input>
        </el-form-item>
        <el-form-item label="grid-area">
          <el-input v-model="gridItem.gridArea" type="text" @change="changeProperty('gridArea', $event)"></el-input>
        </el-form-item>

        <el-form-item label="width">
          <el-input v-model="gridItem.width" type="text" @change="changeProperty('width', $event)"></el-input>
        </el-form-item>
        <el-form-item label="min-width">
          <el-input v-model="gridItem.minWidth" type="text" @change="changeProperty('minWidth', $event)"></el-input>
        </el-form-item>
        <el-form-item label="min-content-width">
          <el-input v-model="gridItem.minContentWidth" type="text" @change="changeProperty('minContentWidth', $event)"></el-input>
        </el-form-item>
        <el-form-item label="max-content-width">
          <el-input v-model="gridItem.maxContentWidth" type="text" @change="changeProperty('maxContentWidth', $event)"></el-input>
        </el-form-item>
        <el-form-item label="min-content-height">
          <el-input v-model="gridItem.minContentHeight" type="text" @change="changeProperty('minContentHeight', $event)"></el-input>
        </el-form-item>
        <el-form-item label="max-content-height">
          <el-input v-model="gridItem.maxContentHeight" type="text" @change="changeProperty('maxContentHeight', $event)"></el-input>
        </el-form-item>
        <el-form-item label="max-width">
          <el-input v-model="gridItem.maxWidth" type="text" @change="changeProperty('maxWidth', $event)"></el-input>
        </el-form-item>

        <el-form-item label="height">
          <el-input v-model="gridItem.height" type="text" @change="changeProperty('height', $event)"></el-input>
        </el-form-item>
        
        <el-form-item label="min-height">
          <el-input v-model="gridItem.minHeight" type="text" @change="changeProperty('minHeight', $event)"></el-input>
        </el-form-item>

        <el-form-item label="max-height">
          <el-input v-model="gridItem.maxHeight" type="text" @change="changeProperty('maxHeight', $event)"></el-input>
        </el-form-item>

        <el-form-item label="box-sizing">
          <el-select v-model="gridItem.boxSizing" placeholder="boxSizing" @change="changeProperty('boxSizing', $event)">
            <el-option label="content-box" value="content-box"></el-option>
            <el-option label="border-box" value="border-box"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="order">
          <el-input v-model="gridItem.order" type="text" @change="changeProperty('order', $event)"></el-input>
        </el-form-item>

        <div style="padding: 20px 10px;">
          <div style="width:80px;margin:auto">
            <el-input v-model="gridItem.borderTop" type="text" @change="changeProperty('borderTop', $event)"></el-input>
          </div>
          <div style="display:flex;margin: 10px">
            <el-input v-model="gridItem.borderLeft" type="text" @change="changeProperty('borderLeft', $event)"></el-input>
            <div style="margin: 10px 20px;">border</div>
            <el-input v-model="gridItem.borderRight" type="text" @change="changeProperty('borderRight', $event)"></el-input>
          </div>
          <div style="width:80px;margin:auto">
            <el-input v-model="gridItem.borderBottom" type="text" @change="changeProperty('borderBottom', $event)"></el-input>
          </div>
        </div>

        <div style="padding: 20px 10px;">
          <div style="width:80px;margin:auto">
            <el-input v-model="gridItem.marginTop" type="text" @change="changeProperty('marginTop', $event)"></el-input>
          </div>
          <div style="display:flex;margin: 10px">
            <el-input v-model="gridItem.marginLeft" type="text" @change="changeProperty('marginLeft', $event)"></el-input>
            <div style="margin: 10px 20px;">margin</div>
            <el-input v-model="gridItem.marginRight" type="text" @change="changeProperty('marginRight', $event)"></el-input>
          </div>
          <div style="width:80px;margin:auto">
            <el-input v-model="gridItem.marginBottom" type="text" @change="changeProperty('marginBottom', $event)"></el-input>
          </div>
        </div>

        <div style="padding: 20px 10px;">
          <div style="width:80px;margin:auto">
            <el-input v-model="gridItem.paddingTop" type="text" @change="changeProperty('paddingTop', $event)"></el-input>
          </div>
          <div style="display:flex;margin: 10px">
            <el-input v-model="gridItem.paddingLeft" type="text" @change="changeProperty('paddingLeft', $event)"></el-input>
            <div style="margin: 10px 20px;">padding</div>
            <el-input v-model="gridItem.paddingRight" type="text" @change="changeProperty('paddingRight', $event)"></el-input>
          </div>
          <div style="width:80px;margin:auto">
            <el-input v-model="gridItem.paddingBottom" type="text" @change="changeProperty('paddingBottom', $event)"></el-input>
          </div>
        </div>

       


      </div>
      
       <div v-if="type === ''" style="padding: 20px;color:#ccc;font-size: 18px;">
         select element & edit
       </div>
    </el-form>
  </div>
</template>

<script>
import event from './event.js';
const gridContainer = {
  gridDirection: 'ltr',
  gridAutoFlow: 'row',
  gridTemplateRows: '',
  gridTemplateColumns: '',
  gridTemplateAreas: '',
  gridAutoRows: '',
  gridAutoColumns: '',
  gridRowGap: '',
  gridColumnGap: '',
  justifyContent: 'stretch',
  alignItems: 'stretch',
  alignContent: 'stretch',
  justifyItems: 'stretch',
  width: 500,
  height: 500,
};
const gridItem = {
  alignSelf: 'auto',
  justifySelf: 'auto',
  gridRowStart: '',
  gridRowEnd: '',
  gridColumnStart: '',
  gridColumnEnd: '',
  gridArea: '',
  width: 100,
  minWidth: '',
  minContentWidth: '',
  maxContentWidth: '',
  minContentHeight: '',
  maxContentHeight: '',
  maxWidth: '',
  height: 100,
  minHeight: '',
  maxHeight: '',
  borderTop: '',
  borderRight: '',
  borderBottom: '',
  borderLeft: '',
  marginTop: '',
  marginRight: '',
  marginBottom: '',
  marginLeft: '',
  paddingTop: '',
  paddingRight: '',
  paddingBottom: '',
  paddingLeft: '',
  boxSizing: 'content-box',
  order: '',
};
export default {
  data() {
    return {
      type: '',
      gridContainer: Object.assign({}, gridContainer),
      gridItem: Object.assign({}, gridItem),
    }
  },
  mounted() {
    event.$on('showgridAside', this.showgridAside);
    event.$on('getgridStyle', this.getgridStyle);
  },
  beforeDestroy() {
    event.$off('showgridAside', this.showgridAside);
    event.$off('getgridStyle', this.getgridStyle);
  },
  methods: {
    getgridStyle(type) {
      if(type === 'container') {
        event.$emit('changegridContainerProperties', Object.assign({}, gridContainer));
      } else if(type === 'item') {
        event.$emit('changegridItemProperties', Object.assign({}, gridItem));
      }
    },
    showgridAside(type, data) {
      this.type = type;
      if (type === 'container') {
        Object.keys(data).forEach((item) => {
          this.gridContainer[item] = data[item];
        });
      } else if(type === 'item') {
        Object.keys(data).forEach((item) => {
          this.gridItem[item] = data[item];
        });
      }
    },
    changeProperty(property, value) {
      if(this.type === 'container') {
        event.$emit('changegridContainerProperties', Object.assign({}, this.gridContainer));
      } else if(this.type === 'item') {
        event.$emit('changegridItemProperties', Object.assign({}, this.gridItem));
      }
    }
  }
}
</script>
