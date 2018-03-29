/**
 * Created by zhuweiwang on 29/03/2018.
 */
/**
 * based on https://bl.ocks.org/animateddata/1f6522d3fcec29c01e7f4a5894e1fd94
 *
 * think about how an svg grid is structured
 <svg>
 <g>
 <rect></rect>
 <rect></rect>
 <rect></rect>
 </g>
 <g>
 <rect></rect>
 <rect></rect>
 <rect></rect>
 </g>
 <g>
 <rect></rect>
 <rect></rect>
 <rect></rect>
 </g>
 </svg>
 */


import React, {Component} from 'react';
import * as d3 from 'd3';
//import './index.css';

class MakeGrid extends Component {
  constructor(props) {
    super(props);

    const geojson = {type: 'Feature', geometry: {type: 'LineString', coordinates: []}};
    this.geojson = geojson;
  }

  componentDidMount() {
    this.drawBall();
    //window.requestAnimationFrame(this.update);
    // this.update();
    this.animationLoop();
  }

  componentDidUpdate() {
    console.log('didupdate occurred');
  }

  drawBall = () => {
    const ballRef = this.ballContainer;
console.log(ballRef);
    this.context = ballRef.getContext('2d');

    console.log(this.context);

    const width = window.innerWidth;
    const height = window.innerHeight;
    const size = d3.min([width, height]);
    this.width = width;
    this.height = height;
    this.size = size;


    d3.select(ballRef)
        .attr('width', width + 'px')
        .attr('height', height + 'px')

    this.context.lineWidth = 0.4;
    this.context.strokeStyle = 'rgba(255,255,255,0.6)';

    const projection = d3.geoOrthographic()
        .scale(0.45 * size)
        .translate([0.5 * width, 0.5 * height]);
    this.projection = projection;

    this.geoGenerator = d3.geoPath()
        .projection(projection)
        .context(this.context);

    console.log(this.context);

  };

  rndLon() {
    // random longitude, 随机经度
    return -180 + Math.random() * 360;
  }

  rndLat() {
    // random latitude, 随机纬度
    return -90 + Math.random() * 180;
  }

  addPoint() {
    let self = this;
    self.geojson.geometry.coordinates.push([self.rndLon(), self.rndLat()])
  }

  update = () => {
    //window.requestAnimationFrame(this.update);

      console.log(this.geojson);
      if (this.geojson.geometry.coordinates.length < 6000) {
        this.addPoint();
      }
      this.projection.rotate([100 / 1000]);

      console.log(this.context);
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.beginPath();
      this.geoGenerator(this.geojson);
      this.context.stroke();

  };

  animationLoop = ()=>{
    this.loop = setTimeout(()=>{
      this.update();
    }, 1000)
  };

  render() {
    return (
        <div style={{backgroundColor: 'red'}} >
          <canvas id="content" ref={ele => this.ballContainer = ele}></canvas>
        </div>
    );
  }
}

export default MakeGrid



