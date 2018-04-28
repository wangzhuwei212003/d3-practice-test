/**
 * Created by zhuweiwang on 2018/4/28.
 */

import React, {Component} from 'react';
import {Form, Row, Col, Input, Button, Icon, Switch, InputNumber, Select} from 'antd';

import {RCTransform} from './CalcOdom';

const FormItem = Form.Item;
const Option = Select.Option;

class OdomForm extends Component {

  state = {
    expand: false,
  };

  handleSearch = (e) => {
    e.preventDefault();
    this.props.form.validateFields((err, values) => {
      console.log('Received values of form: ', values);

      RCTransform(values);

    });
  };

  handleReset = () => {
    this.props.form.resetFields();
  };

  toggle = () => {
    const {expand} = this.state;
    this.setState({expand: !expand});
  };

  // // To generate mock Form.Item
  // getFields() {
  //   const count = this.state.expand ? 10 : 6;
  //   const { getFieldDecorator } = this.props.form;
  //   const children = [];
  //   for (let i = 0; i < 10; i++) {
  //     children.push(
  //         <Col span={8} key={i} style={{ display: i < count ? 'block' : 'none' }}>
  //           <FormItem label={`Field ${i}`}>
  //             {getFieldDecorator(`field-${i}`, {
  //               rules: [{
  //                 required: true,
  //                 message: 'Input something!',
  //               }],
  //             })(
  //                 <Input placeholder="placeholder" />
  //             )}
  //           </FormItem>
  //         </Col>
  //     );
  //   }
  //   return children;
  // }


  /*{
   totoal_count_from_origin:0,
   total_teeth_from_origin:0,
   horizontal_offset_from_nearest_coordinate: 0,
   vertical_offset_from_nearest_coordinate: 0,
   theoretical_moving_direction: 5, // moving down
   current_row: bigRow,
   current_column: bigCol,
   turning: false
   }*/

  getFields() {
    const {getFieldDecorator} = this.props.form;
    const formItemLayout = {
      labelCol: {span: 14},
      wrapperCol: {span: 10},
    };

    //console.log({...formItemLayout});


    return [
      <Col span={12} key={1} style={{display: 'block'}}>
        <FormItem label={`totoal_count_from_origin`} {...formItemLayout}>
          {getFieldDecorator(`totoal_count_from_origin`, {
            rules: [{
              required: false,
              message: 'Input something!',
            }],
          })(
              <Input placeholder="placeholder"/>
          )}
        </FormItem>
      </Col>,

      <Col span={12} key={2} style={{display: 'block'}}>
        <FormItem label={`total_teeth_from_origin`} {...formItemLayout}>
          {getFieldDecorator(`total_teeth_from_origin`, {
            rules: [{
              required: false,
              message: 'Input something!',
            }],
          })(
              <Input placeholder="placeholder"/>
          )}
        </FormItem>
      </Col>,

      <Col span={12} key={3} style={{display: 'block'}}>
        <FormItem label={`horizontal_offset_from_nearest_coordinate`}

                  labelCol={{span: 14}}
                  wrapperCol={{span: 10}}

        >
          {getFieldDecorator(`horizontal_offset_from_nearest_coordinate`, {
            rules: [{
              required: true,
              message: 'Input something!',
            }],
          })(
              <InputNumber placeholder="placeholder"/>
          )}
        </FormItem>
      </Col>,

      <Col span={12} key={4} style={{display: 'block'}}>
        <FormItem label={`vertical_offset_from_nearest_coordinate`} {...formItemLayout}>
          {getFieldDecorator(`vertical_offset_from_nearest_coordinate`, {
            rules: [{
              required: true,
              message: 'Input something!',
            }],
          })(
              <InputNumber placeholder="placeholder"/>
          )}
        </FormItem>
      </Col>,

      <Col span={12} key={5} style={{display: 'block'}}>
        <FormItem label={`theoretical_moving_direction`} {...formItemLayout}>
          {getFieldDecorator(`theoretical_moving_direction`, {
            rules: [{
              required: true,
              message: 'Input something!',
            }],
          })(
              <Select>
                <Option value={2}>2 表示 FORWARD</Option>
                <Option value={3}>3 表示 BACKWARD</Option>
                <Option value={4}>4 表示 UP</Option>
                <Option value={5}>5 表示 DOWN</Option>
              </Select>
          )}
        </FormItem>
      </Col>,

      <Col span={12} key={6} style={{display: 'block'}}>
        <FormItem label={`current_row`} {...formItemLayout}>
          {getFieldDecorator(`current_row`, {
            rules: [{
              required: true,
              message: 'Input something!',
            }],
          })(
              <InputNumber min={0} max={7} placeholder="行数"/>
          )}
        </FormItem>
      </Col>,

      <Col span={12} key={7} style={{display: 'block'}}>
        <FormItem label={`current_column`} {...formItemLayout}>
          {getFieldDecorator(`current_column`, {
            rules: [{
              required: true,
              message: 'Input something!',
            }],
          })(
              <InputNumber min={0} max={8} placeholder="列数"/>
          )}
        </FormItem>
      </Col>,

      <Col span={12} key={8} style={{display: 'block'}}>
        <FormItem label={`turning`} {...formItemLayout}>
          {getFieldDecorator(`turning`, {
            rules: [{
              required: true,
              message: 'Input something!',
            }],
          })(
              <Switch placeholder="placeholder"/>
          )}
        </FormItem>
      </Col>,


    ]
  }

  render() {
    return (
        <Form
            className="ant-advanced-search-form"
            onSubmit={this.handleSearch}
        >
          <Row gutter={24}>{this.getFields()}</Row>
          <Row>
            <Col span={24} style={{textAlign: 'right'}}>
              <Button type="primary" htmlType="submit">Search</Button>
              <Button style={{marginLeft: 8}} onClick={this.handleReset}>
                Clear
              </Button>
              <a style={{marginLeft: 8, fontSize: 12}} onClick={this.toggle}>
                Collapse <Icon type={this.state.expand ? 'up' : 'down'}/>
              </a>
            </Col>
          </Row>
        </Form>
    );

  }
}

export default OdomForm;
