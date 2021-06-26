import './App.css';
import List from './lib/index'
import Item from './components/item'
import {range} from 'lodash'

function App() {
  return (
    <div className="App" style={{height: '100vh', color: '#000'}}>
      <List height={50}>
        {range(1,100).map(item => <div key={item}>
          <Item>Hello world {item}</Item>
        </div>)}
      </List>
    </div>
  );
}

export default App;
