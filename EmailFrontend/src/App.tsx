import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Sidebar from './components/Sidebar';
import EmailList from './components/EmailList';
import EmailDetail from './components/EmailDetail';
import ComposeEmail from './components/ComposeEmail';
import './styles/global.css';

function App() {
  return (
    <Router>
      <Header />
      <Sidebar />
      <Routes>
        <Route path="/inbox" Component={EmailList} />
        <Route path="/email/:id" Component={EmailDetail} />
        <Route path="/compose" Component={ComposeEmail} />
        <Route path="/" Component={EmailList} />
      </Routes>
    </Router>
  );
}

export default App;