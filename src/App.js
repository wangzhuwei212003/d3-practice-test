import React, {Component} from 'react';

import {
  BrowserRouter,
  Route,
  Link
} from 'react-router-dom';

import {Menu, Icon, Button, Layout} from 'antd';


import logo from './logo.svg';
import box from './SvgFile/box.svg';
import marked from './SvgFile/marked.svg';
import markedBox from './SvgFile/markedBox.svg';
import './App.css';

import 'antd/dist/antd.css';

import Home from './example/Home';
import BarChart from './example/BarChart';
import SimpleBarChart from './Tutorials/SimpleBarChart/SimpleBarChart';
import DynamicTable from './Tutorials/DynamicTable/DynamicTable';
import Grid from './Tutorials/MakeGrid';
import Mower from './Tutorials/mowerDemo';
import Tetris from './Tutorials/Tetris';

import Test from './example/Test';

import BasicAStar from './MAPF/BasicAStar';
import Coop4 from './MAPF/Coop4';
// import Coop30 from './MAPF/Coop30';
import RowByCol from './MAPF/RowsByColumns';

const SubMenu = Menu.SubMenu;

const {Header, Footer, Sider, Content} = Layout;

class App extends Component {
  render() {

    return (
        <BrowserRouter>
          <Layout>
            <Header style={{height: 60}}>
              <img src={logo} style={{height: 50}} className="App-logo" alt="logo"/>
            </Header>
            <Layout>
              <Sider>
                <Menu
                    defaultSelectedKeys={['9']}
                    defaultOpenKeys={['sub3-data-visualization']}
                    mode="inline"
                    theme="light"
                    inlineCollapsed={false}
                >
                  <Menu.Item key="1">
                    <Icon type="pie-chart"/>
                    <span><Link to='/'>Home</Link></span>
                  </Menu.Item>
                  <Menu.Item key="2">
                    <Icon type="desktop"/>
                    <span><Link to='/MAPF/BasicAStar'>Basic A star</Link></span>
                  </Menu.Item>
                  <Menu.Item key="3">
                    <Icon type="inbox"/>
                    <span><Link to='/MAPF/Coop4'>Coop 4</Link></span>
                  </Menu.Item>
                  {/*<Menu.Item key="4">
                    <Icon type="inbox"/>
                    <span><Link to='/MAPF/Coop30'>Coop 30</Link></span>
                  </Menu.Item>*/}
                  <Menu.Item key="5">
                    <Icon type="inbox"/>
                    <span><Link to='/MAPF/RowByCol'>Rows by columns</Link></span>
                  </Menu.Item>
                  <SubMenu key="sub1" title={<span><Icon type="mail"/><span>D3 example</span></span>}>
                    <Menu.Item key="5"><Link to='/Tutorials/DynamicTable'>DynamicTable</Link></Menu.Item>
                    <Menu.Item key="6"><Link to='/Tutorials/MakeGrid'>Grid</Link></Menu.Item>
                    <Menu.Item key="7"><Link to='/Tutorials/mowerDemo'>Mower</Link></Menu.Item>
                    <Menu.Item key="8"><Link to='/Tutorials/SimpleBarChart'>SimpleBarChart</Link></Menu.Item>
                    <Menu.Item key="8-1"><Link to='/Tutorials/Tetris'>Tetris</Link></Menu.Item>
                  </SubMenu>
                  <SubMenu key="sub2" title={<span><Icon type="appstore"/><span>D3 Util</span></span>}>

                    <SubMenu key="sub3-data-visualization" title="Data Visualization (CONTINUED...)">
                      <Menu.Item key="9">Option 9</Menu.Item>
                      <Menu.Item key="10">Option 10</Menu.Item>
                    </SubMenu>
                    <SubMenu key="sub3" title="Transitions (TOBE CONTINUED...)">
                      <Menu.Item key="11">TOBE CONTINUED... 11</Menu.Item>
                      <Menu.Item key="12">TOBE CONTINUED... 12</Menu.Item>
                    </SubMenu>
                  </SubMenu>
                </Menu>
              </Sider>
              <Content>
                <Route exact path="/" component={Home}/>
                <Route path="/example/BarChart" component={BarChart}/>
                <Route path="/example/Test" component={Test}/>

                <Route path="/MAPF/BasicAStar" component={BasicAStar}/>
                <Route path="/MAPF/Coop4" component={Coop4}/>
{/*
                <Route path="/MAPF/Coop30" component={Coop30}/>
*/}
                <Route path="/MAPF/RowByCol" component={RowByCol}/>

                <Route path="/Tutorials/DynamicTable" component={DynamicTable}/>
                <Route path="/Tutorials/MakeGrid" component={Grid}/>
                <Route path="/Tutorials/mowerDemo" component={Mower}/>
                <Route path="/Tutorials/SimpleBarChart" component={SimpleBarChart}/>
                <Route path="/Tutorials/Tetris" component={Tetris}/>

              </Content>
            </Layout>
            <Footer>
            </Footer>
          </Layout>
        </BrowserRouter>

    );
  }
}

export default App;
