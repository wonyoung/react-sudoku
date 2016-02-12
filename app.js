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
  return vs;
}
function dupExists(xs) {
  return xs.some((x, i, vs) =>
    vs.filter((n, i2) => i !== i2).some(v => v === x));
}
function validateCells(rows) {
  let cellStates = new Array(9).fill().map(n => new Array(9).fill(true));

  rows.forEach((row, y) => {
    const numbers = row.filter(v => v !== 0);
    if (dupExists(numbers)) {
      for (let x=0;x<cellStates.length;x++) {
        cellStates[y][x] = false;
      }
    }
  });

  for(let x=0;x<cellStates.length;x++) {
    const numbers = rows.map(r => r[x]).filter(v => v !== 0);
    if (dupExists(numbers)) {
      for (let y=0;y<cellStates.length;y++) {
        cellStates[y][x] = false;
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
            cellStates[y][x] = false;
          }
        }
      }
    }
  }

  // cross rule not exists!
  /*
  const cross1 = rows.map((row,y) => row[y]).filter(v => v !== 0);
  const cross2 = rows.map((row,y) => row[cellStates.length-1-y])
    .filter(v => v !== 0);
  if (dupExists(cross1)) {
    for (let x=0;x<cellStates.length;x++) {
      cellStates[x][x] = false;
    }
  }
  if (dupExists(cross2)) {
    for (let x=0;x<cellStates.length;x++) {
      cellStates[x][cellStates.length-1-x] = false;
    }
  }
  */

  return cellStates;
}

class Cell extends React.Component {
  render() {
    const classname = this.props.valid ? "":"wrongnumber";
    return <td className={classname}> { this.props.value } </td>
  }
}

class InputCell extends React.Component {
  handle(evt) {
    const v = parseInt(this.refs.cell.value);
    if (v > 0 && v < 10) {
      this.props.onInput(this.props.col, this.props.row, v);
    }
    else {
      this.refs.cell.value = '';
      this.props.onInput(this.props.col, this.props.row, 0);
    }
  }
  render() {
    const classname = this.props.valid ? "":"wrongnumber";
    return <td className={classname}><input className={classname}
      type="text"
      ref="cell"
      onChange={evt => this.handle(evt)}
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
            return <InputCell
              value={value}
              valid={this.props.cellStates[i]}
              key={i}
              row={this.props.row}
              col={i}
              onInput={this.props.onInput}/>
          }
          else {
            return <Cell
              value={n}
              valid={this.props.cellStates[i]}
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
              cellStates={this.props.cellStates[i]}
              key={i}
              row={this.props.row*3+i}
              onInput={this.props.onInput}
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
    const cellStates = validateCells(rows);
    this.state = {
      rows,
      cellStates
    };
  }

  nextState(x, y, v) {
    let rows = deepCopy(this.state.rows);
    rows[y][x] = v;
    let cellStates = validateCells(rows);
    return {
      rows,
      cellStates
    };
  }

  handleInput(x, y, v) {
    const newState = this.nextState(x, y, v);
    this.setState(newState);
  }

  render() {
    const rs = this.state.rows;
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
              cellStates={this.state.cellStates.slice(r1, r2)}
              key={i}
              row={i}
              onInput={(x,y,v) => this.handleInput(x,y,v)}
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
