import Breadcrumb from '@cpt/Breadcrumb'
import ContentWrapper from '@cpt/ContentWrapper'
import MainContent from '@cpt/MainContent'
import Menu from '@cpt/Menu'
import Router from '@pages/router'
import { Layout } from 'antd'
import React from 'react'
import './App.less'

const { Content, Footer } = Layout
const App = () => (
  <Layout className='app'>
    <Menu/>
    <MainContent>
      <Content className='content-wrapper'>
        <Breadcrumb/>
        <ContentWrapper>
          <Router/>
        </ContentWrapper>
      </Content>
      <Footer style={{ textAlign: 'center', padding: '10px 50px' }}>
        BLOG © 2018 - 2019 Created by Leon
      </Footer>
    </MainContent>
  </Layout>
)

export default App
