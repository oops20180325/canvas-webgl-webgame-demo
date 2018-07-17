
import * as React from 'react'
import Tools from './tools'
import './index.less'
import Utils from '@utils'

interface IProps {
  isMobile: boolean
}

interface IState {
  checkerboard: any[][],
  step: number,
  history: any[]
}

const statusMap = {
  empty: 0,
  black: 1,
  white: 2,
  blackHover: 3,
  whiteHover: 4
}

class Reversi extends React.Component<IProps, IState> {
  componentWillMount() {
    this.reset()
  }

  reset = () => {
    this.setState({
      checkerboard: this.initCheckerboard(),
      history: [],
      step: 0
    })
  }

  initCheckerboard = () => [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 2, 1, 0, 0, 0],
    [0, 0, 0, 1, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ]

  couldClick = ({ x, y }) => {
    const { checkerboard, step } = this.state
    return Tools.couldClick({ x, y, checkerboard, player: step % 2 })
  }

  itemMouseEnter = ({ rowIndex: x, itemIndex: y }) => {
    const { checkerboard, step } = this.state
    const { blackHover, whiteHover } = statusMap
    if (checkerboard[x][y] === statusMap.empty && this.couldClick({ x, y })) {
      checkerboard[x][y] = step % 2 === 0 ? blackHover : whiteHover
      this.setState({ checkerboard })
    }
  }

  itemMouseLeave = ({ rowIndex: x, itemIndex: y }) => {
    const { checkerboard } = this.state
    if (checkerboard[x][y] === statusMap.blackHover
      || checkerboard[x][y] === statusMap.whiteHover) {
      checkerboard[x][y] = statusMap.empty
      this.setState({ checkerboard })
    }
  }

  itemClick = ({ rowIndex: x, itemIndex: y }) => {
    if (!this.couldClick({ x, y })) {
      return
    }
    const { checkerboard, step } = this.state
    const { black, white } = statusMap
    checkerboard[x][y] = step % 2 === 0 ? black : white
    this.setState({ checkerboard, step: step + 1 })
  }

  renderItem = (item, rowIndex, itemIndex) => {
    const status = this.state.checkerboard[rowIndex][itemIndex]
    const { black, white, blackHover, whiteHover } = statusMap
    const className = status ? ['chosen'] : []
    if (className.length) {
      switch (status) {
        case black:
          className.push('black selected')
          break
        case white:
          className.push('white selected')
          break
        case blackHover:
          className.push('black')
          break
        case whiteHover:
          className.push('white')
          break
      }
    }
    return (
      <td className='item' key={itemIndex}
        onClick={Utils.handle(this.itemClick, { rowIndex, itemIndex })}
        onMouseOver={Utils.handle(this.itemMouseEnter, { rowIndex, itemIndex })}
        onMouseLeave={Utils.handle(this.itemMouseLeave, { rowIndex, itemIndex })}
      >
        <div className={className.join(' ')} />
      </td>
    )
  }

  renderRow = (row, rowIndex) => (
    <tr className='row' key={rowIndex}>
      {row.map((item, itemIndex) => this.renderItem(item, rowIndex, itemIndex))}
    </tr>
  )

  render() {
    const { checkerboard } = this.state
    return (
      <div className='reversi-wrapper'>
        <div className='checkerboard'>
          <table>
            <tbody>
              {checkerboard.map(this.renderRow)}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
}

export default Utils.connect({
  component: Reversi,
  mapStateToProps: state => ({
    isMobile: state.common.isMobile
  }),
})