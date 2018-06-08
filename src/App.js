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

import CellVisual from './RealCell/visual';
import OdomForShow from './OdomForShow/visual';
import calcTeeth from './CalcTeethAndAction/visual';
import findParkingGoal from './FindParkingGoal/visual';

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

                  <Menu.Item key="7">
                    <Icon type="inbox"/>
                    <span><Link to='/Cell/visual'>priority可视化</Link></span>
                  </Menu.Item>
                  <Menu.Item key="8">
                    <Icon type="inbox"/>
                    <span><Link to='/OdomForShow'>percent for frontUI</Link></span>
                  </Menu.Item>
                  <Menu.Item key="9">
                    <Icon type="inbox"/>
                    <span><Link to='/calcTeeth'>calTeethAndPinAction</Link></span>
                  </Menu.Item>
                  <Menu.Item key="10">
                    <Icon type="inbox"/>
                    <span><Link to='/findParkingGoal'>findParkingGoal</Link></span>
                  </Menu.Item>

                </Menu>
              </Sider>
              <Content>
                <Route exact path="/" component={Home}/>

                <Route path="/Cell/visual" component={CellVisual}/>
                <Route path="/OdomForShow" component={OdomForShow}/>
                <Route path="/calcTeeth" component={calcTeeth}/>
                <Route path="/findParkingGoal" component={findParkingGoal}/>


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
