import './app.css';
import React from 'react';
import ReactDom from 'react-dom';

const container = document.getElementById('app');

const sudokuProblem = [
  [3,0,0,2,4,0,0,6,0],
  [0,4,0,0,0,0,0,5,3],
  [1,8,9,6,3,5,4,0,0],
  [0,0,0,0,8,0,2,0,0],
  [0,0,7,4,9,6,8,0,1],
  [8,9,3,1,5,0,6,0,4],
  [0,0,1,9,2,0,5,0,0],
  [2,0,0,3,0,0,7,4,0],
  [9,6,0,5,0,0,3,0,2]
];

function deepCopy(vs) {
  if (vs instanceof Array) {
    let arr = [];
    vs.forEach(v => arr.push(deepCopy(v)));
    return arr;
  }
  if (typeof vs === "object") {
    let obj = {};
    for(let pname in vs) {
      if (vs.hasOwnProperty(pname)) {
        obj[pname] = deepCopy(vs[pname]);
      }
    }
    return obj;
  }
  return vs;
}
function dupExists(xs) {
  return xs.some((x, i, vs) =>
    vs.filter((n, i2) => i !== i2).some(v => v === x));
}
function validateCells(rows) {
  const cellWidth = 9;
  let cellClassNames = new Array(cellWidth).fill().map(n => new Array(cellWidth).fill("normal"));

  rows.forEach((row, y) => {
    const numbers = row.filter(v => v !== 0);
    if (dupExists(numbers)) {
      for (let x=0;x<cellWidth;x++) {
        cellClassNames[y][x] = "wrongnumber";
      }
    }
    else if (numbers.length === 9) {
      for (let x=0;x<cellWidth;x++) {
        if (cellClassNames[y][x] === "normal") {
          cellClassNames[y][x] = "correctnumber"
        }
      }
    }
  });

  for(let x=0;x<cellWidth;x++) {
    const numbers = rows.map(r => r[x]).filter(v => v !== 0);
    if (dupExists(numbers)) {
      for (let y=0;y<cellWidth;y++) {
        cellClassNames[y][x] = "wrongnumber";
      }
    }
    else if (numbers.length === 9) {
      for (let y=0;y<cellWidth;y++) {
        if (cellClassNames[y][x] === "normal") {
          cellClassNames[y][x] = "correctnumber"
        }
      }
    }
  }

  for(let xb=0;xb<3;xb++) {
    for(let yb=0;yb<3;yb++) {
      const x1 = xb * 3;
      const x2 = (xb + 1) * 3;
      const y1 = yb * 3;
      const y2 = (yb + 1) * 3;
      const numbers = rows[y1].slice(x1, x2)
        .concat(rows[y1+1].slice(x1, x2))
        .concat(rows[y1+2].slice(x1, x2))
        .filter(v => v !== 0);
      if (dupExists(numbers)) {
        for (let y=y1;y<y2;y++) {
          for (let x=x1;x<x2;x++) {
            cellClassNames[y][x] = "wrongnumber";
          }
        }
      }
      else if (numbers.length === 9) {
        for (let y=y1;y<y2;y++) {
          for (let x=x1;x<x2;x++) {
            if (cellClassNames[y][x] === "normal") {
              cellClassNames[y][x] = "correctnumber";
            }
          }
        }
      }
    }
  }

  return cellClassNames;
}

class Cell extends React.Component {
  render() {
    const classname = this.props.cellClassName;
    return <td className={classname}> { this.props.value } </td>
  }
}

class InputCell extends React.Component {
  handle(evt) {
    console.log(evt.keyCode);
    if (evt.keyCode >= 49 && evt.keyCode <= 58) {
      this.props.onInput(this.props.col, this.props.row, parseInt(String.fromCharCode(evt.keyCode)));
    }
    else if (evt.keyCode === 32) {
      this.props.onInput(this.props.col, this.props.row, 0);
    }
    else if (evt.keyCode >= 37 && evt.keyCode <= 40) {
      this.props.onMove(evt.keyCode);
    }
  }

  componentDidMount() {
    if (this.props.focused) this._input.focus();
  }

  componentDidUpdate() {
    if (this.props.focused) this._input.focus();
  }

  render() {
    const classname = this.props.cellClassName;
    return <td className={classname}><input className={classname}
      type="text"
      ref={c => this._input = c}
      value = {this.props.value}
      onKeyDown={evt => this.handle(evt)}
      /></td>
  }
}

class Row extends React.Component {
  render() {
    return (
      <tr>
        {this.props.values.map((n, i) => {
          if (this.props.initValues[i]==0) {
            const value = n > 0 ? n:'';
            const c = this.props.cursor;
            const focused = c.x === i && c.y === this.props.row;
            if (focused) console.log(c);
            return <InputCell
              value={value}
              focused={focused}
              cellClassName={this.props.cellClassNames[i]}
              key={i}
              row={this.props.row}
              col={i}
              onInput={this.props.onInput}
              onMove={this.props.onMove}
              />
          }
          else {
            return <Cell
              value={n}
              cellClassName={this.props.cellClassNames[i]}
              key={i}/>
          }
        })}
      </tr>
    )
  }
}

class Row3 extends React.Component {
  render() {
    return (
      <tbody>
        {
          this.props.lines.map((line, i) => {
            return <Row
              initValues={this.props.initLines[i]}
              values={line}
              cursor={this.props.cursor}
              cellClassNames={this.props.cellClassNames[i]}
              key={i}
              row={this.props.row*3+i}
              onInput={this.props.onInput}
              onMove={this.props.onMove}
              />
          })
        }
      </tbody>
    )
  }
}

class Sudoku extends React.Component {
  constructor(props) {
    super(props);
    const rows = deepCopy(this.props.init);
    const inputboxes = rows.map((rs, y) => rs.map((v, x) => {return {x,y,v};})
                                             .filter(c => c.v === 0))
                           .reduce((a,b) => a.concat(b));
    const cursor = inputboxes[0];
    this.state = {
      rows,
      cursor
    };
  }

  nextState(x, y, v) {
    let rows = deepCopy(this.state.rows);
    rows[y][x] = v;
    return {
      rows,
      cursor: this.state.cursor
    };
  }

  handleInput(x, y, v) {
    const newState = this.nextState(x, y, v);
    this.setState(newState);
  }

  handleCursor(keycode) {
    let cursor = deepCopy(this.state.cursor);
    if (keycode === 37) {
      let x = cursor.x;
      for(let x=cursor.x-1;x>=0;x--) {
        if (this.props.init[cursor.y][x] === 0) {
          cursor.x = x;
          break;
        }
      }
    }
    if (keycode === 38) {
      let y = cursor.y;
      for(let y=cursor.y-1;y>=0;y--) {
        if (this.props.init[y][cursor.x] === 0) {
          cursor.y = y;
          break;
        }
      }
    }
    if (keycode === 39) {
      let x = cursor.x;
      for(let x=cursor.x+1;x<this.props.init.length;x++) {
        if (this.props.init[cursor.y][x] === 0) {
          cursor.x = x;
          break;
        }
      }
    }
    if (keycode === 40) {
      let y = cursor.y;
      for(let y=cursor.y+1;y<this.props.init.length;y++) {
        if (this.props.init[y][cursor.x] === 0) {
          cursor.y = y;
          break;
        }
      }
    }
    this.setState({rows:this.state.rows, cursor})
  }

  render() {
    const rs = this.state.rows;
    const cellClassNames = validateCells(rs);
    return (
      <table>
        <colgroup><col/><col/><col/></colgroup>
        <colgroup><col/><col/><col/></colgroup>
        <colgroup><col/><col/><col/></colgroup>
        {
          [0, 1, 2].map((i) => {
            const r1 = i * 3;
            const r2 = (i + 1) * 3;
            return <Row3
              initLines={this.props.init.slice(r1, r2)}
              lines={this.state.rows.slice(r1, r2)}
              cursor={this.state.cursor}
              cellClassNames={cellClassNames.slice(r1, r2)}
              key={i}
              row={i}
              onInput={(x,y,v) => this.handleInput(x,y,v)}
              onMove={keyCode => this.handleCursor(keyCode)}
              />
          })
        }
      </table>
    );
  }
}

ReactDom.render(
  <Sudoku init={sudokuProblem}/>
  , container
);
