import { Input } from 'antd'
import React from 'react'
import './index.less'
import Word from './Word'
import FoodOptions from './food.json'
const Search = Input.Search

interface IFoodState {
  loaded: boolean;
}

class Food extends React.Component<{}, IFoodState> {
  canvas
  wrapper
  search
  words = {}
  interval
  wordsAttr: any[] = []
  constructor(props) {
    super(props)
    this.state = {
      loaded: false
    }
  }

  onSearch = v => {
    console.log(v);
    const { offsetHeight: h, offsetWidth: w } = this.wrapper
    const searchWord = new Word({ key:v,words:this.words,w,h });
    this.wordsAttr.push(searchWord);
    this.search.setValue('');
    console.log(this.search)
  }

  componentDidMount() {
    this.setState({ loaded: true }, () => this.initCanvas(FoodOptions))
  }

  initCanvas = res => {
    this.words = res
    const { offsetHeight: h, offsetWidth: w } = this.wrapper
    const words = this.words
    const c = this.canvas.getContext('2d')
    this.canvas.width = w
    this.canvas.height = h

    c.fillStyle = '#000'
    c.globalAlpha = 0.2

    for (const key in this.words) {
      if (key) {
        this.wordsAttr.push(new Word({ key, words, w, h }))
      }
    }

    const move = () => {
      this.wordsAttr.forEach((_, i) => {
        if (this.wordsAttr[i].x > w) {
          this.wordsAttr[i].x = -this.wordsAttr[i].width
          this.wordsAttr[i].y = Math.random() * h
        } else {
          this.wordsAttr[i].x += this.wordsAttr[i].speed
        }
      })
    }

    const animation = () => {
      this.wordsAttr.forEach((_, i) => {
        c.font = this.wordsAttr[i].font
        c.fillText(this.wordsAttr[i].text, this.wordsAttr[i].x, this.wordsAttr[i].y)
        this.wordsAttr[i].width = c.measureText(this.wordsAttr[i].text).width
        c.stroke()
      })
      move()
    }

    const init = () => {
      c.clearRect(0, 0, w, h)
      animation()
    }

    if (requestAnimationFrame) {
      const loop = () => {
        init()
        requestAnimationFrame(loop)
      }
      loop()
    } else {
      this.interval = setInterval(init, 24)
    }
  }

  componentWillUnmount() {
    clearInterval(this.interval)
  }

  render() {
    const { loaded } = this.state
    return (
      <div className="food-wrapper" ref={el => (this.wrapper = el)}>
        {
          loaded ? (
            <>
              <div className="input">
                <Search
                  ref={el=>this.search = el}
                  placeholder="food you want"
                  enterButton="Add"
                  size="large"
                  onSearch={this.onSearch}
                />
              </div>
              <canvas
                id="c"
                className="canvas"
                ref={el => (this.canvas = el)}
                style={{ opacity: loaded ? 1 : 0 }}
              />
            </>
          ) : (
            <div className="loader" />
          )
        }
      </div>
    )
  }
}

export default Food
