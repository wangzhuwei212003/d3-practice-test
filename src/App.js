import React, {Component} from 'react';

import {
  BrowserRouter,
  Route,
  Link
} from 'react-router-dom';

import {Menu, Icon, Button, Layout} from 'antd';

import logo from './logo.svg';
import './App.css';

import 'antd/dist/antd.css';

import Home from './example/Home';

import BasicAStar from './MAPF/BasicAStar';
import Coop4 from './MAPF/Coop4';
import Coop30 from './MAPF/Coop30';

import CellVisual from './RealCell/visual';
import OdomForShow from './OdomForShow/visual';

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
                    defaultSelectedKeys={['1']}
                    defaultOpenKeys={['sub1']}
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
                  <Menu.Item key="4">
                    <Icon type="inbox"/>
                    <span><Link to='/MAPF/Coop30'>Coop 30</Link></span>
                  </Menu.Item>

                  <Menu.Item key="7">
                    <Icon type="inbox"/>
                    <span><Link to='/Cell/visual'>Real cell</Link></span>
                  </Menu.Item>
                  <Menu.Item key="8">
                    <Icon type="inbox"/>
                    <span><Link to='/OdomForShow'>用odom算位置报告超出的百分比</Link></span>
                  </Menu.Item>

                </Menu>
              </Sider>
              <Content>
                <Route exact path="/" component={Home}/>

                <Route path="/MAPF/BasicAStar" component={BasicAStar}/>
                <Route path="/MAPF/Coop4" component={Coop4}/>
                <Route path="/MAPF/Coop30" component={Coop30}/>

                <Route path="/Cell/visual" component={CellVisual}/>
                <Route path="/OdomForShow" component={OdomForShow}/>


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
