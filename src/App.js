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
import Test from './example/Test';
import S_TeethCalc from './example/S_TeethCalc';

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

                  <Menu.Item key="6"><Link to='/example/Test'>test 算总齿数</Link></Menu.Item>
                  <Menu.Item key="6-1"><Link to='/example/S_TeethCalc'>test 算S形弯道齿数</Link></Menu.Item>


                </Menu>
              </Sider>
              <Content>
                <Route exact path="/" component={Home}/>
                <Route path="/example/Test" component={Test}/>
                <Route path="/example/S_TeethCalc" component={S_TeethCalc}/>

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
