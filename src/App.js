import React, { useState, useCallback } from 'react';

import { 
  Row,
  Col,
  Label,
  Button,
  Input,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem
} from 'reactstrap';

import {
  Stage,
  Layer,
  Text,
  Group,
  Rect,
  Line
} from 'react-konva';

import _bigInt from 'big-integer'
import { mimc7 } from 'circomlib'
import { bigInt } from 'snarkjs'
import { createMerkleTree } from './utils/merkletree.js'

import bonsai from './bonsai.png'

import 'bootstrap/dist/css/bootstrap.min.css';

const nodeWidth = 90
const nodeHeight = 30

const ActionTypes = {
  Insert: "Insert",
  Update: "Update"
}

const HashButton = () => {
  const [hashInput, setHashInput] = useState('')
  const [hashOutput, setHashOutput] = useState(0)

  return (
    <div>
      <Row>
        <Col sm="12">
          <Label>Hash Input</Label>
          <Input
            onChange={(e) => setHashInput(
              e.target.value
              .split(',')
              .map(x => x.replace(' ', ''))
              .map(x => {
                const b = new _bigInt(x, 16)
                return bigInt(b.toString())
              })
            )}
            placeholder="0,1,2,3"
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Col sm="12">
          <Button
            onClick={() => {
              setHashOutput(mimc7.multiHash(hashInput).toString(16))
            }}
            color="primary"
            block
          >
            Hash
          </Button>
        </Col>
      </Row>
      <br />
      <Row>
        <Col sm="12">
          <Label>Hash Output</Label><br />
          <span style={{ wordWrap: 'break-word' }}>{hashOutput}</span>
        </Col>
      </Row>
    </div>
  )
}

const SideBar = ({ selectedLeaf, setMerkleTree, merkleTree }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [action, setAction] = useState(ActionTypes.Insert)

  const [leafIndex, setLeafIndex] = useState('')
  const [leafValue, setLeafValue] = useState('')

  return (
    <div>
      <img alt="logo" src={bonsai} height="32" style={{ float: 'left', paddingRight: '20px' }}/>
      <h3>Merkle Tree Visualization</h3>
      <hr />
      <Row>
        <Col sm="4">
          <Label>Action</Label>
          <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
            <DropdownToggle color="primary" block caret>
              {action}
            </DropdownToggle>
            <DropdownMenu>
              {
                Object
                  .keys(ActionTypes)
                  .map(x => {
                    return (
                      <DropdownItem 
                        key={x}
                        onClick={() => setAction(ActionTypes[x])}
                      >
                        {ActionTypes[x]}
                      </DropdownItem>
                    )
                  })
              }
            </DropdownMenu>
          </Dropdown>
        </Col>
        <Col sm="4">
          <Label>Leaf Index</Label>
          <Input
            onChange={(e) => {
              if (e.target.value === '') {
                setLeafIndex('')
                return
              }

              try {
                bigInt(e.target.value)
                setLeafIndex(e.target.value)
              } catch {}
            }}
            value={leafIndex}
            disabled={action === ActionTypes.Insert} placeholder="0"
          />
        </Col>
        <Col sm="4">
          <Label>Leaf Value</Label>
          <Input 
            onChange={(e) => {
              if (e.target.value === '') {
                setLeafValue('')
                return
              }

              try {
                new _bigInt(e.target.value, 16)
                setLeafValue(e.target.value)
              } catch { }
            }}
            placeholder="0"
            value={leafValue}
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Col sm="12">
          <Button
            onClick={() => {
              const b = new _bigInt(leafValue, 16)

              if (action === ActionTypes.Insert) {
                merkleTree.insert(b)
                setMerkleTree(merkleTree)
              } else if (action === ActionTypes.Update) {
                const idx = parseInt(leafIndex)
                const paths = merkleTree.getPathUpdate(idx)
                merkleTree.update(idx, b, paths[0] )
                setMerkleTree(merkleTree)
              } else if (action === ActionTypes.Verify) {
                // merkleTree.insert(b)
                // setMerkleTree(merkleTree)
              }
            }}
            color="primary"
            block
          >
            Go
          </Button>
        </Col>
      </Row>
      <hr />
      <HashButton />
      <hr />
    </div>
  )
}

const LeafNode = ({ isHighlightedPath, isLatestIndex, setSelectedLeaf, leafData, text, x, y}) => {
  const [selected, setSelected] = useState(false)

  const t = text.length <= 8 ? text : text.slice(0, 8) + '..'

  const color = isHighlightedPath ? '#FF9F1C' : (isLatestIndex ? '#2EC4B6' : '#011627')

  return (
    <Group>
      <Rect
        onMouseEnter={() => {
          setSelected(true) 
          setSelectedLeaf(leafData)
        }}
        onMouseLeave={() => {
          setSelected(false) 
          // setSelectedLeaf({})
        }}
        x={x}
        y={y}
        width={nodeWidth}
        height={nodeHeight}
        stroke={color}
        strokeWidth={selected ? 3 : 2}
      />
      <Text
        onMouseEnter={() => {
          setSelected(true) 
          setSelectedLeaf(leafData)
        }}
        onMouseLeave={() => {
          setSelected(false) 
          // setSelectedLeaf({})
        }}
        text={t}
        fill={color}
        fontSize={15}
        fontStyle={selected ? 'bold' : 'normal'}
        x={t.includes('..') ? x + 10 : x + nodeWidth/2 - (t.length * 3)} y={y + 9}
      />
    </Group>
  );
}

const DynamicSizedCanvas = ({ merkleTree, selectedLeaf, setSelectedLeaf }) => {
  const [width, setWidth] = useState(0)

  const minWidth = width > 900 ? width : 900
  const height = 260

  // Convert selectedLeaf.pathIndexes to easily
  // check if cur index is selected
  let pathIndexes = selectedLeaf.pathIndexes || []
  let pathIndexMap = {}
  for (let k = 0; k <= m.depth; k++) {
    pathIndexMap[k] = {}
  }
  pathIndexes.forEach(e => {
    pathIndexMap[e[0]][e[1]] = true
  })

  const renderMerkleTree = () => {
    let nodes = []
    let nodePosition = {}

    for (let i = 0; i <= merkleTree.depth; i++) {
      const itemsInLevel = Math.pow(2, i)

      nodePosition[i] = {}

      for (let j = 0; j < itemsInLevel; j++) {
        let t

        if (i === merkleTree.depth) {
          try {
            t = merkleTree.leaves[j].toString(16)
          } catch {
            t = merkleTree.zeroValue.toString(16)
          }
        } else if (i === 0) {
          t = merkleTree.root.toString(16)
        } else {
          try {
            t = merkleTree.filledPaths[merkleTree.depth - i][j].toString(16)
          } catch {
            t = merkleTree.filledSubtrees[merkleTree.depth - i].toString(16)
          }
        }

        const paddingX = parseInt(width/(1 + itemsInLevel))
        const x = ((j+1)*paddingX) - (nodeWidth/2)
        const y = 40+(i*60)

        nodePosition[i][j] = [x, y]

        let leafData = {
          value: t.toString()
        }

        if (i === merkleTree.depth) {
          try {
            const paths = merkleTree.getPathUpdate(j)

            leafData.path = paths[0]
            leafData.pathIndexes = paths[1]
          } catch { }
        }

        const isHighlightedPath = pathIndexMap[merkleTree.depth - i][j] === true

        nodes.push(
          <LeafNode
            key={`${i}-${j}`}
            isLatestIndex={merkleTree.nextIndex - 1 === j && i === merkleTree.depth}
            isHighlightedPath={isHighlightedPath}
            setSelectedLeaf={setSelectedLeaf}
            leafData={leafData}
            text={t}
            x={x}
            y={y}
          />
        )

        // Only draw lines if you're not in root
        if (i > 0) {
          const rootPosition = nodePosition[i-1][parseInt(j/2)]
          nodes.push(
            <Line
              key={`line-${i}-${j}`}
              points={
                [
                  x+(nodeWidth/2), y,
                  rootPosition[0]+(nodeWidth/2), rootPosition[1]+nodeHeight
                ]
              }
              strokeWidth={2}
              stroke={'#011627'}
            />
          )
        }
      }
    }

    return nodes
  }

  return (
    <div style={{ minWidth: minWidth, width: '100%' }} ref={useCallback((node) => { 
      if (node !== null) {
        setWidth(node.getBoundingClientRect().width);
      }
    }, [])}>
      <Stage width={width} height={height}>
        <Layer>
        <Text
          text={'Latest Leaf Index: ' + (merkleTree.nextIndex - 1).toString()}
          fill={'#2EC4B6'}
          fontSize={15}
          fontStyle={'bold'}
          x={5} y={5}
        />
        {
          renderMerkleTree()
        }
      </Layer>
      </Stage>
    </div>
  )
}

const InfoSection = ({ selectedLeaf }) => {
  return (
    <Row>
      <Col sm="12">
        <div>
          {
            selectedLeaf.value === undefined ? null :
            (
              <div>
                <Label><strong>Value</strong>:</Label>&nbsp;&nbsp;
                <span style={{ wordWrap: 'break-word' }}>
                  {
                    '0x' + selectedLeaf.value.toString()
                  }
                </span>
              </div>
            )
          }
          {
            selectedLeaf.path === undefined ? null :
            (
              <div>
                <Label><strong>Path</strong>:</Label>&nbsp;&nbsp;
                <span style={{ color: '#FF9F1C', wordWrap: 'break-word' }}>
                  {
                      "[" + selectedLeaf.path.map(x => x.toString(16)).join(', ') + "]"
                  }
                </span>
              </div>
            )
          }
        </div>
      </Col>
    </Row>
  )
}

const m = createMerkleTree(3, bigInt(0))
m.insert(bigInt(32767))

const App = () => {
  const [selectedLeaf, setSelectedLeaf] = useState({})
  const [merkleTree, setMerkleTree] = useState(m)

  return (
      <Row style={{ padding: '30px', height: '100vh' }}>
        <Col sm="4">
          <SideBar
            merkleTree={Object.assign(Object.create(Object.getPrototypeOf(merkleTree)), merkleTree)}
            setMerkleTree={setMerkleTree}
            selectedLeaf={selectedLeaf}
          />
        </Col>
        <Col sm="8">
          <DynamicSizedCanvas
            merkleTree={Object.assign(Object.create(Object.getPrototypeOf(merkleTree)), merkleTree)}
            setSelectedLeaf={setSelectedLeaf}
            selectedLeaf={selectedLeaf}
          />
          <hr />
          <InfoSection
            selectedLeaf={selectedLeaf}
          />
        </Col>
      </Row>
  );
}

export default App;
