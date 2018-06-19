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
import Coop4Highway from './MAPF/Coop4Highway';
import CBS from './MAPF/CBS';
import CBSReal from './MAPF/CBSReal';
// import Coop30 from './MAPF/Coop30'; 30和4其实仅仅是配置的不同

import LoadMap from './MAPF/LoadMap';

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
                    <span><Link to='/MAPF/CBS'>CBS</Link></span>
                  </Menu.Item>
                  <Menu.Item key="4-1">
                    <Icon type="inbox"/>
                    <span><Link to='/MAPF/CBSReal'>CBSReal</Link></span>
                  </Menu.Item>
                  {/*<Menu.Item key="4">*/}
                    {/*<Icon type="inbox"/>*/}
                    {/*<span><Link to='/MAPF/Coop30'>Coop 30</Link></span>*/}
                  {/*</Menu.Item>*/}
                  <Menu.Item key="5">
                    <Icon type="inbox"/>
                    <span><Link to='/MAPF/LoadMap'>LoadMap</Link></span>
                  </Menu.Item>
                  <Menu.Item key="5-1">
                    <Icon type="inbox"/>
                    <span><Link to='/MAPF/Coop4Highway'>Coop4Highway</Link></span>
                  </Menu.Item>


                </Menu>
              </Sider>
              <Content>
                <Route exact path="/" component={Home}/>

                <Route path="/MAPF/BasicAStar" component={BasicAStar}/>
                <Route path="/MAPF/Coop4" component={Coop4}/>
                <Route path="/MAPF/Coop4Highway" component={Coop4Highway}/>
                <Route path="/MAPF/CBS" component={CBS}/>
                <Route path="/MAPF/CBSReal" component={CBSReal}/>
                {/*<Route path="/MAPF/Coop30" component={Coop30}/>*/}

                <Route path="/MAPF/LoadMap" component={LoadMap}/>

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
