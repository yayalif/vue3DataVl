<!--
 * @Description: 首页折现图组件
 * @Author: ZY
 * @Date: 2021-01-18 09:31:32
 * @LastEditors: ZY
 * @LastEditTime: 2021-01-26 10:04:16
-->
<template>
  <div
    id="mapChartsComponents1"
    :class="className"
    :style="{height: height, width: width}"
  />
</template>

<script lang="ts">
/* eslint-disable */
import { nextTick, defineComponent, onActivated, onBeforeUnmount, onDeactivated, onMounted } from 'vue'
import resize from '@/components/charts/mixins/resize'
import * as echarts from 'echarts/core';
import {
  ScatterChart,
  ScatterSeriesOption,
  EffectScatterChart,
  EffectScatterSeriesOption
} from 'echarts/charts';
import {
  TooltipComponent,
  TitleComponentOption
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';
import {
  install as AMapComponent,
  AMapComponentOption
} from 'echarts-extension-amap/export';

// import the official type definition for AMap 2.0
import '@amap/amap-jsapi-types';

// compose required options
type ECOption = echarts.ComposeOption<
  | ScatterSeriesOption
  | EffectScatterSeriesOption
  | TitleComponentOption
  // unite AMapComponentOption with the initial options of AMap `AMap.MapOptions`
> & AMapComponentOption<AMap.MapOptions>;

// register renderers, components and charts
echarts.use([
  CanvasRenderer,
  TooltipComponent,
  AMapComponent,
  ScatterChart,
  EffectScatterChart
]);

export default defineComponent({
  props: {
    className: {
      type: String,
      default: 'chart'
    },
    width: {
      type: String,
      default: '100%',
      required: true
    },
    height: {
      type: String,
      default: '100%',
      required: true
    }
  },
  setup(props) {
    const {
      mounted,
      chart,
      beforeDestroy,
      activated,
      deactivated
    } = resize()
   const data = [
    { name: "海门", value: 9 },
    { name: "鄂尔多斯", value: 12 },
    { name: "招远", value: 12 },
    { name: "舟山", value: 12 },
    { name: "齐齐哈尔", value: 14 },
    { name: "盐城", value: 15 },
    { name: "赤峰", value: 16 },
    { name: "青岛", value: 18 }
    ];

    const geoCoordMap = {
      海门: [121.15, 31.89],
      鄂尔多斯: [109.781327, 39.608266],
      招远: [120.38, 37.35],
      舟山: [122.207216, 29.985295],
      齐齐哈尔: [123.97, 47.33],
      盐城: [120.13, 33.38],
      赤峰: [118.87, 42.28],
      青岛: [120.33, 36.07]
    };

    const convertData = function (data) {
      const res = [];
      for (let i = 0; i < data.length; i++) {
        let geoCoord = geoCoordMap[data[i].name];
        if (geoCoord) {
          res.push({
            name: data[i].name,
            value: geoCoord.concat(data[i].value)
          });
        }
      }
      return res;
    };
    let oAmap = null;
    const option:ECOption = {
      // amap component option
      amap: {
        // enable 3D mode
        viewMode: "3D",
        // initial options of AMap
        // See https://lbs.amap.com/api/javascript-api/reference/map#MapOption for details
        // initial map center [lng, lat]
        center: [108.39, 39.9],
        // initial map zoom
        zoom: 4,
        // whether the map and echarts automatically handles browser window resize to update itself.
        resizeEnable: true,
        // customized map style, see https://lbs.amap.com/dev/mapstyle/index for details
        mapStyle: "amap://styles/dark",
        // whether echarts layer should be rendered when the map is moving. Default is true.
        // if false, it will only be re-rendered after the map `moveend`.
        // It's better to set this option to false if data is large.
        renderOnMoving: true,
        // the zIndex of echarts layer for AMap, default value is 2000.
        // deprecated since v1.9.0, use `echartsLayerInteractive` instead.
        // echartsLayerZIndex: 2019,
        // whether echarts layer is interactive. Default value is true
        // supported since v1.9.0
        echartsLayerInteractive: true,
        // whether to enable large mode. Default value is false
        // supported since v1.9.0
        largeMode: false,
        // whether to return map camera state in `amaproam` event.
        // supported since v1.10.0
        returnMapCameraState: true
        // Note: Please DO NOT use the initial option `layers` to add Satellite/RoadNet/Other layers now.
        // There are some bugs about it, we can use `amap.add` instead.
        // Refer to the codes at the bottom.

        // More initial options...
      },
      tooltip: {
        trigger: "item"
      },
      animation: false,
      series: [
        {
          name: "Top 5",
          type: "effectScatter",
          coordinateSystem: "amap",
          data: convertData(
            data
              .sort(function (a, b) {
                return b.value - a.value;
              })
              .slice(0, 6)
          ),
          symbolSize: function (val) {
            return val[2] / 10;
          },
          encode: {
            value: 2
          },
          showEffectOn: "render",
          rippleEffect: {
            brushType: "stroke"
          },
          hoverAnimation: true,
          label: {
            formatter: "{b}",
            position: "right",
            show: true
          },
          itemStyle: {
            color: "rgba(255, 165, 66, 0.8)",
            shadowBlur: 100,
            shadowColor: "#999"
          },
          zlevel: 1
        }
      ]
    };
    
    const initChart = () => {
        // initialize echart
        const mapChart = echarts.init(document.getElementById('mapChartsComponents1') as HTMLDivElement)
        mapChart.setOption(option);
        // listen to AMap roam event
        // `returnMapCameraState` should be opened if map camera information is needed
        mapChart.on("amaproam", function (e) {
          console.log(e);
        });

        // // get AMap extension component
        const amapComponent = mapChart.getModel().getComponent<AMapComponentOption>('amap');
        // // get the instance of AMap
        oAmap = amapComponent.getAMap()
        // add some controls provided by AMap.
        oAmap.addControl(new AMap.Scale());
        oAmap.addControl(new AMap.ToolBar());
        // add SatelliteLayer and RoadNetLayer to map
        // const satelliteLayer = new AMap.TileLayer.Satellite();
        // amap.add(satelliteLayer);
        // const roadNetLayer = new AMap.TileLayer.RoadNet();
        // amap.add(roadNetLayer);
        // Add a marker to map
        const marker = new AMap.Marker({
          position: [109, 35]
        })
        // Add click event listener to the marker
        marker.on('click',  (e) => {
          const zoomLevel = oAmap.getZoom(); // Get the current zoom level
          const newZoomLevel = zoomLevel + 1; // Increase the zoom level by 1
          oAmap.setZoom(newZoomLevel);
          oAmap.setCenter([ e.target.getPosition().lng, e.target.getPosition().lat], false, 500);
          console.log('Marker clicked', e.target.getPosition());
        });
        oAmap.add( marker );
        // Make the overlay layer of AMap interactive
        amapComponent.setEChartsLayerInteractive(false);
    }
    // 百度地图API功能
    // var local = new BMap.LocalSearch(map, {
    //   renderOptions:{map: map,selectFirstResult:true,autoViewport:false}
    // });
    // local.search("众美城B区");


    onMounted(() => {
      mounted()
      nextTick(() => {
        initChart()
      })
    })

    onBeforeUnmount(() => {
      beforeDestroy()
      if (!chart.value) {
        return
      }
      chart.value.dispose()
      chart.value = null
    })

    onActivated(() => {
      activated()
    })

    onDeactivated(() => {
      deactivated()
    })

    return {

    }
  }
})
</script>
