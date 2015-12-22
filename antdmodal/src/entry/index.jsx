import '../css';
import React from 'react';
import ReactDOM from 'react-dom';
import Button from 'antd/lib/button';
import Modal from 'antd/lib/modal';

const App = React.createClass({
  getInitialState() {
    return { visible: false };
  },
  showModal() {
    this.setState({
      visible: true
    });
  },
  handleOk() {
    console.log('点击了确定');
    this.setState({
      visible: false
    });
  },
  handleCancel() {
    this.setState({
      visible: false
    });
  },
  render() {
    return <div>
      <Button type="primary" onClick={this.showModal}>显示对话框</Button>
      <Modal title="第一个 Modal" visible={this.state.visible}
        onOk={this.handleOk} onCancel={this.handleCancel}>
        <p>对话框的内容</p>
        <p>对话框的内容</p>
        <p>对话框的内容</p>
      </Modal>
    </div>;
  }
});

ReactDOM.render(<App />, document.getElementById('components-modal-demo-basic'));