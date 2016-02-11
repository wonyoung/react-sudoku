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

class Cell extends React.Component {
  render() {
    return <td> { this.props.value } </td>
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
    }
  }
  render() {
    return <td><input
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
              row={this.props.row}
              col={i}
              value={value}
              key={i}
              onInput={this.props.onInput}/>
          }
          else {
            return <Cell
              value={n}
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
              values={line}
              initValues={this.props.initLines[i]}
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
    this.state = { rows };
  }

  newRows(x, y, v) {
    let rows = deepCopy(this.state.rows);
    rows[y][x] = v;
    return rows;
  }

  handleInput(x, y, v) {
    const rows = this.newRows(x, y, v);
    this.setState({rows});
  }

  render() {
    const rs = this.state.rows;
    return (
      <table>
        <colgroup><col/><col/><col/></colgroup>
        <colgroup><col/><col/><col/></colgroup>
        <colgroup><col/><col/><col/></colgroup>
        {
          [0, 1, 2].map((i) =>
            <Row3
              initLines={this.props.init.slice(i*3, (i+1)*3)}
              lines={this.state.rows.slice(i*3, (i+1)*3)}
              key={i}
              row={i}
              onInput={(x,y,v) => this.handleInput(x,y,v)}
              />)
        }
      </table>
    );
  }
}

ReactDom.render(
  <Sudoku init={sudokuProblem}/>
  , container
);
