import React, { useState, useCallback, useRef, useMemo } from 'react'
import Utils from '@utils'
import { useCountUp } from 'react-countup'
import { RedoOutlined } from '@constant/icons'
import './index.less'

const colors = ['#4E79A5', '#F18F3B', '#E0585B', '#77B7B2']

const randomNum = (min, max) =>
  parseInt(Math.random() * (max - min + 1) + min, 10)

const initItem = () => ({
  key: Utils.uuid(),
  color: colors[randomNum(0, 3)],
  value: randomNum(1, 3),
  opacity: 1
})

const getItems = () => {
  const list: any = []
  for (let i = 0; i < 6; i++) {
    const itemList: any = []
    for (let j = 0; j < 6; j++) {
      itemList.push(initItem())
    }
    list.push(itemList)
  }
  return list
}

const getItemClass = (row, col, comboList, { isNew = false, isComboed = false }) => {
  const index = comboList.findIndex((item) => {
    return Number(item.row) === Number(row) && Number(item.col) === Number(col)
  })
  const className = ['item']
  if (index >= 0) {
    className.push('active')
  }
  if (isNew) {
    className.push('new')
  }
  if (isComboed) {
    className.push('expand')
  }
  return className.join(' ')
}

const calculateNewItemList = (list) => {
  for (let col = 0; col < list.length; col++) {
    const colList = list.map(item => item[col]).filter(item => item.opacity === 1)
    const newItemsList: any = []
    for (let num = 0; num < list.length - colList.length; num++) {
      newItemsList.push({
        ...initItem(),
        isNew: true
      })
    }
    ;[...newItemsList, ...colList].map((item, i) => {
      const { top, ...rest } = item
      list[i][col] = rest
    })
  }
  return [...list]
}

function deDuplicate(list) {
  const res: any = {}
  list.forEach(item => {
    const key = item + ''
    if (!res[key]) {
      res[key] = 1
    } else {
      res[key] += 1
    }
  })
  return Object.keys(res).length === 1
}

/**
 * 
 * @param list  getCombo([1, 2, 3, 3, 3, 5, 3, 3, 3, 3])
 * @returns     [{ "pointer":2, "length":3 },{ "pointer":6, "length":4 }]
 */
function getCombo(list = [], offset = 0) {
  if (list.length < 3) return []
  let length = 3
  let hasCombo = false

  while (length <= list.length && deDuplicate(list.slice(0, length))) {
    length += 1
    hasCombo = true
  }
  length -= 1
  if (hasCombo) {
    list.splice(0, length)
    return [{ pointer: offset, length }, ...getCombo(list, offset + length)]
  } else {
    const [_, ...rest] = list
    return getCombo(rest, offset + 1)
  }
}

const DualMatch3 = (props: any) => {
  const { isMobile } = props

  const wrapperRef = useRef<any>()
  const gameRef = useRef<any>()
  const staticItem = useRef<any>()
  const [itemList, setItemList] = useState(getItems())
  const [draging, setDraging] = useState(false)
  const [comboList, setComboList] = useState<any>([])
  const [lineColor, setLineColor] = useState<string>()
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const { countUp: count, update: setCount } = useCountUp({
    start: 0,
    end: 0,
    duration: 0.5
  })
  const [isCombo, setIsCombo] = useState(false)
  const [comboCount, setComboCount] = useState(30)

  const wrapperSize = useMemo(() => {
    return isMobile ? 312 : 340
  }, [isMobile])

  const itemPosition = useMemo(() => {
    return isMobile ? 55 : 60
  }, [isMobile])

  const itemSize = useMemo(() => {
    return isMobile ? 36 : 40
  }, [isMobile])

  const containerStyle = useCallback((num = 0) => {
    return {
      width: wrapperSize + num,
      height: wrapperSize + num,
    }
  }, [isMobile])

  const itemStyle = useCallback(
    ({ row, col, item }) => {
      const { color, opacity = 1, top = 0 } = item
      return {
        top: row * itemPosition + top,
        left: col * itemPosition,
        width: itemSize,
        height: itemSize,
        background: color,
        opacity,
      }
    },
    [isMobile]
  )

  const selectedItems = useMemo(() => {
    // getCombo
    const valueList = comboList.map((item: any) => Number(item.value))
    const list = getCombo(valueList)
    setIsCombo(!!list.length)
    const newList = [...comboList]
    list.forEach(({ pointer, length }) => {
      for (let i = pointer; i < pointer + length; i++) {
        newList[i] = {
          ...newList[i],
          value: newList[i].value * 10,
          isComboed: true,
        }
      }
    })
    return newList
  }, [comboList])

  const svgLinePoints = useMemo(() => {
    if (!draging) return []
    const {
      left: gameLeft,
      top: gameTop,
    } = gameRef.current.getBoundingClientRect()
    const {
      left: wrapperLeft,
      top: wrapperTop,
    } = wrapperRef.current.getBoundingClientRect()
    const positions = selectedItems.map((item: any) => {
      const { row, col } = item
      return {
        x: col * itemPosition - wrapperLeft + gameLeft + itemSize / 2,
        y: row * itemPosition - wrapperTop + gameTop + itemSize / 2,
      }
    })
    return [...positions, mousePos]
  }, [draging, selectedItems, mousePos, isMobile])

  const mouseEnter = useCallback(
    ({ row, col, item }) => {
      if (!draging) return
      const { key, color, value } = item
      const index = comboList.findIndex((item) => item.key === key)
      if (index === comboList.length - 1) {
        if (comboList.length > 1) {
          setComboList((comboList) => comboList.slice(0, comboList.length - 1))
        }
      } else {
        // ???????????????????????????
        const latest = comboList[comboList.length - 1]
        const { row: latestRow, col: latestCol } = latest
        const isNeighbour = (Math.abs(latestRow - row) < 2) && (Math.abs(latestCol - col) < 2)
        if (isNeighbour && index === -1 && lineColor === color) {
          setComboList((comboList) => comboList.concat({ row, col, key, value }))
        }
      }
    },
    [comboList, draging, lineColor]
  )

  const doSetMousePosition = (e) => {
    const {
      left: wrapperLeft,
      top: wrapperTop,
    } = wrapperRef.current.getBoundingClientRect()
    const mouseLeft = e.pageX || e.touches[0].pageX
    const mouseTop = e.pageY || e.touches[0].pageY

    const left = mouseLeft - wrapperLeft
    const top = mouseTop - wrapperTop
    setMousePos({ x: left, y: top })
  }

  const onDragStart = (e, row, col, item: any) => {
    setDraging(true)
    doSetMousePosition(e)
    setComboList(() => [{ row, col, key: item.key, value: item.value }])
    setLineColor(item.color)
    e.preventDefault()
  }

  const wrapperMouseMove = useCallback(
    (e) => {
      if (!draging || isMobile) return
      doSetMousePosition(e)
    },
    [comboList, draging]
  )

  const mouseUp = useCallback(() => {
    if (comboList.length >= 3) {
      // set point
      setCount(Number(count) + selectedItems.reduce((total, item) => total + Number(item.value), 0))

      !isCombo && setComboCount(count => count - 1)

      // hide combo item
      comboList.forEach((item) => {
        const { row, col } = item
        itemList[row][col].opacity = 0
      })

      // gravity effect
      const tempList: any = [[], [], [], [], [], []]
      for (let col = 0; col < 6; col++) {
        let top = 0
        let row = 5
        let list: any = []

        while (row >= 0) {
          const item = itemList[row][col]
          item.top = top
          if (item.opacity === 0) {
            top += itemPosition
          }
          row--
          list = [item, ...list]
        }

        list.forEach((item: any, row) => {
          tempList[row].push({ ...item })
        })
      }

      setItemList(tempList)

      setTimeout(() => {
        const list = calculateNewItemList(itemList)
        setItemList(list)
        setTimeout(() => {
          setItemList(list.map((row) => row.map(({ isNew, ...rest }) => rest)))
        }, 100)
      }, 200)
    }
    setDraging(false)
    setComboList([])
  }, [comboList, itemList, isCombo])

  const touchMove = e => {
    if (!isMobile) return
    const touch = e.targetTouches[0]
    const currTarget: any = document.elementFromPoint(Math.floor(touch.pageX), Math.floor(touch.pageY))
    if (currTarget.className.indexOf && currTarget.className.indexOf('item') >= 0) {
      if (!staticItem.current) {
        const col = currTarget.getAttribute('col')
        const row = currTarget.getAttribute('row')
        const value = currTarget.getAttribute('value')
        const color = currTarget.getAttribute('color')
        const key = currTarget.getAttribute('unique')
        staticItem.current = {
          col, row, value, key
        }
        const item = { color, key, value }
        if (draging) {
          mouseEnter({ row, col, item })
        } else {
          onDragStart(e, row, col, item)
        }
      }
    } else {
      staticItem.current = null
    }
    doSetMousePosition(e)
    e.preventDefault()
  }

  return (
    <div
      className="dual-match-3-wrapper"
      ref={wrapperRef}
      onMouseUp={mouseUp}
      onMouseMove={wrapperMouseMove}
      onTouchMove={touchMove}
      onTouchEnd={mouseUp}
    >
      <svg
        className="svg-container"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
      >
        {svgLinePoints.map((points, i) => {
          if (i !== 0) {
            const prevPoints = svgLinePoints[i - 1]
            return (
              <line
                key={i}
                x1={prevPoints.x}
                y1={prevPoints.y}
                x2={points.x}
                y2={points.y}
                style={{ stroke: lineColor, strokeWidth: 5 }}
              />
            )
          }
          return null
        })}
      </svg>
      <div className="point-wrapper">
        <div className="point-item">
          <div className="point">{count}</div>
          <div className="title">??????</div>
        </div>
        <div className="point-item">
          <div className="point">{comboCount}</div>
          <div className="title">?????????</div>
        </div>
      </div>
      {
        comboCount === 0 ? (
          <div
            className="game-over"
            style={containerStyle(20)}
            onClick={() => {
              setComboCount(30)
              setCount(0)
            }} 
          >
            <RedoOutlined style={{ color: '#fff' }} />
          </div>
        ) : null
      }
      <div className="game-area" ref={gameRef} style={containerStyle(0)}>
        {itemList.map((list: any, row: number) =>
          list.map((item: any, col: number) => {
            const comboItem =
              selectedItems.find(
                ({ row: itemRow, col: itemCol }) => 
                  Number(row) === Number(itemRow) && Number(col) === Number(itemCol)
              )

            return (
              <div
                className={getItemClass(row, col, comboList, comboItem || item)}
                key={item.key}
                style={itemStyle({ row, col, item })}
                // @ts-ignore
                row={row}
                col={col}
                color={item.color}
                value={item.value}
                unique={item.key}
                onMouseDown={(e) => {
                  onDragStart(e, row, col, item)
                }}
                onTouchStart={(e) => {
                  onDragStart(e, row, col, item)
                }}
                onMouseEnter={() => !isMobile && mouseEnter({ row, col, item })}
              >
                {(comboItem || item).value}
              </div>
            )
          })
        )}
      </div>
      <div className="combo-displayer">
        {
          selectedItems.map((comboItem, i) => {
            const { value, row, col, isComboed } = comboItem
            const item = { color: lineColor }
            return <div key={i} className={`combo-item ${isComboed ? 'expand' : ''}`} style={itemStyle({ row, col, item })}>{value}</div>
          })
        }
      </div>
    </div>
  )
}

export default Utils.connect({
  component: DualMatch3,
  mapStateToProps: (state) => ({
    isMobile: state.common.isMobile,
  }),
})
