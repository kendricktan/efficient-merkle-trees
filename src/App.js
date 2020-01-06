import React, { useState, useCallback } from 'react';

import { 
  Container,
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

import { Stage, Layer, Text, Group, Rect } from 'react-konva';

import { bigInt } from 'snarkjs'
import { createMerkleTree } from './utils/merkletree.js'

import bonsai from './bonsai.png'

import 'bootstrap/dist/css/bootstrap.min.css';

const nodeWidth = 90
const nodeHeight = 30

const ActionTypes = {
  Insert: "Insert",
  Update: "Update",
  Verify: "Verify"
}

const AppSettings = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [action, setAction] = useState(ActionTypes.Insert)

  return (
    <div style={{ paddingTop: '30px' }}>
      <img alt="logo" src={bonsai} height="48" style={{ float: 'left', paddingRight: '30px' }}/>
      <h1>Efficient Merkle Tree Visualization</h1>
      <hr />
      <Row>
        <Col sm="4">
          <Label>Action</Label>
          <Dropdown isOpen={dropdownOpen} toggle={() => setDropdownOpen(!dropdownOpen)}>
            <DropdownToggle block caret>
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
          <Input disabled={action === ActionTypes.Insert} placeholder="0" />
        </Col>
        <Col sm="4">
          <Label>Leaf Value</Label>
          <Input placeholder="0" />
        </Col>
      </Row>
      <br />
      <Row>
        <Col sm="12">
          <Button block>
            Go
          </Button>
        </Col>
      </Row>

      <hr />
    </div>
  )
}

const TreeNode = ({text, x, y}) => {
  let t

  if (text === '0') {
    t = text
  } else {
    t = text.slice(0, 8) + '..'
  }

  return (
    <Group>
      <Rect
        x={x}
        y={y}
        width={nodeWidth}
        height={nodeHeight}
        stroke={'black'}
        onClick={(x) => console.log(x)}
      />
      <Text text={t} fontSize={15} x={t === '0' ? x + nodeWidth/2 - 5 : x + 10} y={y + 9}/>
    </Group>
  );
}

const DynamicSizedCanvas = () => {
  const [width, setWidth] = useState(0)

  const minWidth = width > 900 ? width : 900
  const height = 500

  const m = createMerkleTree(4, bigInt(0))

  const renderMerkleTree = () => {
    let nodes = []

    for (let i = 0; i < m.depth; i++) {
      const itemsInLevel = Math.pow(2, i)

      if (i === 0) {
        // Root
        nodes.push(<TreeNode text={m.root.toString(16)} x={width/2 - nodeWidth/2} y={40} />)
      } else if (i < m.depth - 1) {
        // Subtrees
        for (let j = 0; j < itemsInLevel; j++) {
          let t

          try {
            t = m.filledPaths[i][j].toString(16)
          } catch {
            t = m.filledSubtrees[i].toString(16)
          }

          const paddingX = parseInt(width/(1 + itemsInLevel))

          nodes.push(
            <TreeNode text={t} x={((j+1)*paddingX) - (nodeWidth/2)} y={40+(i*60)} />
          )
        }
      } else {
        // Leaves
        for (let j = 0; j < itemsInLevel; j++) {
          let t

          try {
            t = m.leaves[j].toString(16)
          } catch {
            t = m.zeroValue.toString(16)
          }

          const paddingX = parseInt(width/(1 + itemsInLevel))

          nodes.push(
            <TreeNode text={t} x={((j+1)*paddingX) - (nodeWidth/2)} y={40+(i*60)} />
          )
        }
      }
    }

    return nodes
  }

  return (
    <div style={{ minWidth: minWidth, width: '100%', height: '100%'}} ref={useCallback((node) => { 
      if (node !== null) {
        setWidth(node.getBoundingClientRect().width);
      }
    }, [])}>
      <Stage width={width} height={height}>
        <Layer>
        {
          renderMerkleTree()
        }
      </Layer>
      </Stage>
    </div>
  )
}


const App = () => {
  return (
    <Container>
      <Row>
        <Col sm="12" md={{ size: 8, offset: 2 }}>
          <AppSettings />
        </Col>
        <Col sm="12" md="12">
          <DynamicSizedCanvas />
        </Col>
      </Row>
    </Container>
  );
}

export default App;
